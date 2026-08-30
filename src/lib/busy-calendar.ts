import connectToDatabase from '@/lib/mongodb';
import AppSettings from '@/models/AppSettings';
import BusyBlock from '@/models/BusyBlock';
import {
  addDaysToDateStr,
  localTodayStr,
  type OccupiedSlot,
} from '@/lib/appointments';

const ICS_TIMEOUT_MS = 15_000;
const WINDOW_DAYS = 21;
const ICS_MAX_BYTES = 2_000_000;
const ICS_MAX_REDIRECTS = 3;
const ICS_MAX_EVENTS = 500;

/** Only known calendar hosts — blocks SSRF to internal/metadata. */
const ALLOWED_HOST_SUFFIXES = [
  'icloud.com',
  'icloud.com.cn',
  'google.com',
  'googleusercontent.com',
  'googleapis.com',
  'outlook.office365.com',
  'outlook.live.com',
  'office.com',
  'office365.com',
  'live.com',
] as const;

function isAllowedCalendarHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) {
    return false;
  }
  // Reject raw IPs (IPv4/IPv6)
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':')) {
    return false;
  }
  return ALLOWED_HOST_SUFFIXES.some((suffix) => h === suffix || h.endsWith(`.${suffix}`));
}

export function assertSafeIcsUrl(
  rawUrl: string,
): { ok: true; url: string } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(normalizeIcsUrl(rawUrl));
  } catch {
    return { ok: false, error: 'Невірний URL' };
  }
  if (parsed.protocol !== 'https:') {
    return { ok: false, error: 'Потрібен https або webcal URL' };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, error: 'URL з логіном/паролем не підтримується' };
  }
  if (!isAllowedCalendarHost(parsed.hostname)) {
    return {
      ok: false,
      error:
        'Дозволені лише календарі iCloud / Google / Outlook. Перевірте секретну iCal-адресу.',
    };
  }
  return { ok: true, url: parsed.toString() };
}

function isPrivateOrLocalIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::1' || v === '0.0.0.0') return true;
  if (v.startsWith('127.') || v.startsWith('10.') || v.startsWith('192.168.')) {
    return true;
  }
  if (v.startsWith('169.254.') || v.startsWith('0.')) return true;
  const m = v.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')) return true;
  return false;
}

async function assertPublicResolvedHost(hostname: string): Promise<string | null> {
  try {
    const { lookup } = await import('dns/promises');
    const results = await lookup(hostname, { all: true, verbatim: true });
    if (!results.length) return 'DNS: хост не знайдено';
    for (const r of results) {
      if (isPrivateOrLocalIp(r.address)) {
        return 'Заборонено резолвити на приватну/локальну IP';
      }
    }
    return null;
  } catch {
    return 'DNS lookup не вдався';
  }
}

async function readResponseTextLimited(
  res: Response,
  maxBytes: number,
): Promise<string> {
  if (!res.body) {
    const t = await res.text();
    if (Buffer.byteLength(t, 'utf8') > maxBytes) {
      throw new Error('ICS занадто великий');
    }
    return t;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          /* ignore */
        }
        throw new Error('ICS занадто великий');
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
}

async function fetchIcsWithGuards(startUrl: string): Promise<
  { ok: true; text: string } | { ok: false; error: string }
> {
  let current = startUrl;

  for (let hop = 0; hop <= ICS_MAX_REDIRECTS; hop++) {
    const safe = assertSafeIcsUrl(current);
    if (!safe.ok) return { ok: false, error: safe.error };

    const dnsErr = await assertPublicResolvedHost(new URL(safe.url).hostname);
    if (dnsErr) return { ok: false, error: dnsErr };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ICS_TIMEOUT_MS);
    try {
      const res = await fetch(safe.url, {
        signal: controller.signal,
        headers: { Accept: 'text/calendar, text/plain, */*' },
        redirect: 'manual',
        cache: 'no-store',
      });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const loc = res.headers.get('location');
        if (!loc) return { ok: false, error: 'Редирект без Location' };
        current = new URL(loc, safe.url).toString();
        continue;
      }

      if (!res.ok) {
        return {
          ok: false,
          error: `Календар повернув HTTP ${res.status}`,
        };
      }

      const text = await readResponseTextLimited(res, ICS_MAX_BYTES);
      return { ok: true, text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'fetch failed';
      return { ok: false, error: msg };
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, error: 'Забагато редиректів' };
}

export type ParsedBusyEvent = {
  uid: string;
  startAt: Date;
  endAt: Date;
  summary: string;
  description: string;
  allDay: boolean;
};

export function normalizeIcsUrl(url: string): string {
  const trimmed = url.trim();
  if (/^webcals?:\/\//i.test(trimmed)) {
    return trimmed.replace(/^webcals?:\/\//i, 'https://');
  }
  return trimmed;
}

function unfoldIcs(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
}

function unescapeIcs(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

/** Parse ICS datetime to Date (floating local treated as Europe/Kyiv wall clock → UTC approx via offset). */
function parseIcsDateTime(
  raw: string,
  params: string,
): { date: Date; allDay: boolean } | null {
  const value = raw.trim();
  const isDateOnly =
    params.includes('VALUE=DATE') || /^\d{8}$/.test(value.split(/[;:]/).pop() || '');

  // Strip TZID params from value if present as DATE:xxx
  const bare = value.includes(':') ? value.split(':').pop()! : value;

  if (/^\d{8}$/.test(bare) || isDateOnly) {
    const y = Number(bare.slice(0, 4));
    const m = Number(bare.slice(4, 6));
    const d = Number(bare.slice(6, 8));
    // All-day: start 00:00 Kyiv — store as UTC noon-safe via Date.UTC midnight local approximation
    const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    return { date: start, allDay: true };
  }

  const m = bare.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return null;
  const [, ys, ms, ds, hh, mm, ss, z] = m;
  if (z) {
    return {
      date: new Date(
        Date.UTC(+ys, +ms - 1, +ds, +hh, +mm, +ss),
      ),
      allDay: false,
    };
  }
  // Floating: interpret as Europe/Kyiv by formatting offset.
  // Use temporal trick: construct as UTC then subtract Kyiv offset at that instant.
  const asUtc = Date.UTC(+ys, +ms - 1, +ds, +hh, +mm, +ss);
  const probe = new Date(asUtc);
  const kyivOffsetMin = getTimeZoneOffsetMinutes(probe, 'Europe/Kyiv');
  return { date: new Date(asUtc - kyivOffsetMin * 60_000), allDay: false };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const tz =
    parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT+0';
  const match = tz.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const mins = Number(match[3] || 0);
  return sign * (hours * 60 + mins);
}

function formatKyivParts(date: Date): { date: string; time: string } {
  const d = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const tParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hh = tParts.find((p) => p.type === 'hour')?.value || '00';
  const mm = tParts.find((p) => p.type === 'minute')?.value || '00';
  return { date: d, time: `${hh}:${mm}` };
}

export function parseIcsEvents(icsText: string): ParsedBusyEvent[] {
  const text = unfoldIcs(icsText);
  const blocks = text.split(/BEGIN:VEVENT/i).slice(1);
  const events: ParsedBusyEvent[] = [];

  for (const block of blocks) {
    const body = block.split(/END:VEVENT/i)[0] || '';
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);

    let uid = '';
    let summary = '';
    let description = '';
    let dtStartRaw = '';
    let dtStartParams = '';
    let dtEndRaw = '';
    let dtEndParams = '';
    let duration = '';

    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx < 0) continue;
      const left = line.slice(0, idx);
      const right = line.slice(idx + 1);
      const [name, ...paramParts] = left.split(';');
      const params = paramParts.join(';').toUpperCase();
      const key = name.toUpperCase();

      if (key === 'UID') uid = right.trim();
      else if (key === 'SUMMARY') summary = unescapeIcs(right);
      else if (key === 'DESCRIPTION') description = unescapeIcs(right);
      else if (key === 'DTSTART') {
        dtStartRaw = right;
        dtStartParams = params;
      } else if (key === 'DTEND') {
        dtEndRaw = right;
        dtEndParams = params;
      } else if (key === 'DURATION') duration = right.trim();
    }

    if (!uid || !dtStartRaw) continue;
    const startParsed = parseIcsDateTime(dtStartRaw, dtStartParams);
    if (!startParsed) continue;

    let endAt: Date;
    let allDay = startParsed.allDay;

    if (dtEndRaw) {
      const endParsed = parseIcsDateTime(dtEndRaw, dtEndParams);
      if (!endParsed) continue;
      endAt = endParsed.date;
      allDay = allDay || endParsed.allDay;
    } else if (duration) {
      const durMs = parseDurationMs(duration);
      endAt = new Date(startParsed.date.getTime() + durMs);
    } else if (allDay) {
      endAt = new Date(startParsed.date.getTime() + 24 * 60 * 60 * 1000);
    } else {
      endAt = new Date(startParsed.date.getTime() + 60 * 60 * 1000);
    }

    if (endAt <= startParsed.date) {
      endAt = new Date(startParsed.date.getTime() + 60 * 60 * 1000);
    }

    events.push({
      uid,
      startAt: startParsed.date,
      endAt,
      summary: summary.slice(0, 500),
      description: description.slice(0, 2000),
      allDay,
    });
  }

  return events;
}

function parseDurationMs(duration: string): number {
  // P1DT2H30M / PT1H
  const m = duration.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i,
  );
  if (!m) return 60 * 60 * 1000;
  const days = Number(m[1] || 0);
  const hours = Number(m[2] || 0);
  const mins = Number(m[3] || 0);
  const secs = Number(m[4] || 0);
  return ((days * 24 + hours) * 60 + mins) * 60 * 1000 + secs * 1000;
}

export async function getAppSettings() {
  await connectToDatabase();
  let doc = await AppSettings.findOne({ key: 'default' });
  if (!doc) {
    doc = await AppSettings.create({ key: 'default' });
  }
  return doc;
}

export function maskIcsUrl(url: string): string {
  if (!url) return '';
  if (url.length < 24) return '••••';
  return `${url.slice(0, 12)}…${url.slice(-8)}`;
}

export async function fetchAndSyncPersonalCalendar(icsUrl: string): Promise<{
  ok: boolean;
  count: number;
  error?: string;
}> {
  const safe = assertSafeIcsUrl(icsUrl);
  if (!safe.ok) {
    return { ok: false, count: 0, error: safe.error };
  }

  const fetched = await fetchIcsWithGuards(safe.url);
  if (!fetched.ok) {
    return { ok: false, count: 0, error: fetched.error };
  }
  const text = fetched.text;

  if (!/BEGIN:VCALENDAR/i.test(text)) {
    return { ok: false, count: 0, error: 'Відповідь не схожа на ICS' };
  }

  const today = localTodayStr();
  const windowEnd = addDaysToDateStr(today, WINDOW_DAYS);
  const windowStartMs = new Date(`${today}T00:00:00+03:00`).getTime();
  const windowEndMs = new Date(`${windowEnd}T23:59:59+03:00`).getTime();

  const parsed = parseIcsEvents(text)
    .filter(
      (e) =>
        e.endAt.getTime() >= windowStartMs && e.startAt.getTime() <= windowEndMs,
    )
    .slice(0, ICS_MAX_EVENTS);

  await connectToDatabase();

  const uids = parsed.map((e) => e.uid);
  for (const ev of parsed) {
    await BusyBlock.findOneAndUpdate(
      { uid: ev.uid },
      {
        uid: ev.uid,
        startAt: ev.startAt,
        endAt: ev.endAt,
        summary: ev.summary,
        description: ev.description,
        allDay: ev.allDay,
        source: 'personal_ics',
      },
      { upsert: true, new: true },
    );
  }

  // Remove stale personal events
  await BusyBlock.deleteMany({
    source: 'personal_ics',
    endAt: { $lt: new Date(windowStartMs) },
  });
  if (uids.length > 0) {
    await BusyBlock.deleteMany({
      source: 'personal_ics',
      uid: { $nin: uids },
      startAt: {
        $gte: new Date(windowStartMs),
        $lte: new Date(windowEndMs),
      },
    });
  } else {
    await BusyBlock.deleteMany({
      source: 'personal_ics',
      startAt: {
        $gte: new Date(windowStartMs),
        $lte: new Date(windowEndMs),
      },
    });
  }

  await AppSettings.findOneAndUpdate(
    { key: 'default' },
    {
      personalIcsSyncedAt: new Date(),
      personalIcsLastError: '',
    },
  );

  return { ok: true, count: parsed.length };
}

export async function listUpcomingBusyBlocks(limit = 40) {
  await connectToDatabase();
  const now = new Date();
  const end = new Date(now.getTime() + WINDOW_DAYS * 86400000);
  return BusyBlock.find({
    source: 'personal_ics',
    endAt: { $gte: now },
    startAt: { $lte: end },
  })
    .sort({ startAt: 1 })
    .limit(limit)
    .lean();
}

/** Convert busy blocks to occupied slots for free-window / overlap helpers. */
export function busyBlocksToOccupied(
  blocks: Array<{
    _id?: unknown;
    startAt: Date;
    endAt: Date;
    allDay?: boolean;
  }>,
): OccupiedSlot[] {
  const out: OccupiedSlot[] = [];
  for (const b of blocks) {
    const start = new Date(b.startAt);
    const end = new Date(b.endAt);
    if (b.allDay) {
      const { date } = formatKyivParts(start);
      out.push({
        clientId: `busy-${String(b._id || date)}`,
        date,
        time: '00:00',
        durationMinutes: 24 * 60,
      });
      continue;
    }
    const startK = formatKyivParts(start);
    const durationMinutes = Math.max(
      15,
      Math.round((end.getTime() - start.getTime()) / 60000),
    );
    out.push({
      clientId: `busy-${String(b._id || start.toISOString())}`,
      date: startK.date,
      time: startK.time,
      durationMinutes,
    });
  }
  return out;
}

export function formatBusyNoteLine(block: {
  startAt: Date;
  endAt: Date;
  summary?: string;
  description?: string;
  allDay?: boolean;
}): string {
  const start = formatKyivParts(new Date(block.startAt));
  const end = formatKyivParts(new Date(block.endAt));
  const note = [block.summary, block.description]
    .filter(Boolean)
    .join(' — ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const when = block.allDay
    ? `${start.date} (весь день)`
    : `${start.date} ${start.time}–${end.time}`;
  return note ? `${when}: ${note}` : `${when}: (без тексту)`;
}
