/** Appointment helpers — date yyyy-MM-dd + time HH:mm (Europe/Kyiv local, no TZ suffix). */

export type AppointmentSlot = {
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  durationMinutes?: number;
};

export function isValidDateStr(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidTimeStr(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

export function parseSlot(
  date?: string | null,
  time?: string | null,
): AppointmentSlot | null {
  if (!date || !isValidDateStr(date)) return null;
  const t = time && isValidTimeStr(time) ? time : '10:00';
  return { date, time: t };
}

/** Combine to sortable key: 2026-08-30T14:00 */
export function slotKey(date: string, time = '10:00'): string {
  return `${date}T${time}`;
}

export function addMinutesToTime(
  date: string,
  time: string,
  minutes: number,
): { date: string; time: string } {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + minutes * 60_000);
  return {
    date: [
      end.getFullYear(),
      String(end.getMonth() + 1).padStart(2, '0'),
      String(end.getDate()).padStart(2, '0'),
    ].join('-'),
    time: [
      String(end.getHours()).padStart(2, '0'),
      String(end.getMinutes()).padStart(2, '0'),
    ].join(':'),
  };
}

function toIcsLocal(date: string, time: string): string {
  const [y, m, d] = date.split('-');
  const [hh, mm] = time.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

function escapeIcsText(value: string): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export type IcsEventInput = {
  uid: string;
  summary: string;
  description?: string;
  date: string;
  time: string;
  durationMinutes?: number;
};

/** Build a multi-event calendar feed (CRLF). */
export function buildIcsCalendar(
  events: IcsEventInput[],
  calendarName = 'VelvetSkin',
): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VelvetSkin CRM//UA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Kyiv',
  ];

  for (const event of events) {
    const duration = event.durationMinutes ?? 60;
    const end = addMinutesToTime(event.date, event.time, duration);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(event.uid)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsLocal(event.date, event.time)}`,
      `DTEND:${toIcsLocal(end.date, end.time)}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
    );
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function formatSlotUk(date: string, time?: string): string {
  if (!date) return '';
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  const label = new Date(y, m - 1, d).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return time ? `${label}, ${time}` : label;
}

/** Monday-start week containing the given date (yyyy-MM-dd). */
export function weekDates(anchorDate: string): string[] {
  const [y, m, d] = anchorDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 Sun
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(y, m - 1, d + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return [
      x.getFullYear(),
      String(x.getMonth() + 1).padStart(2, '0'),
      String(x.getDate()).padStart(2, '0'),
    ].join('-');
  });
}

export function localTodayStr(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kyiv',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function kyivClock(now: Date): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return { hour, minute };
}

export function addDaysToDateStr(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const x = new Date(Date.UTC(y, m - 1, d + days));
  return [
    x.getUTCFullYear(),
    String(x.getUTCMonth() + 1).padStart(2, '0'),
    String(x.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

export type OccupiedSlot = {
  clientId: string;
  date: string;
  time: string;
  durationMinutes?: number;
};

/** True if two intervals overlap (default duration 60). */
export function slotsOverlap(
  a: { date: string; time: string; durationMinutes?: number },
  b: { date: string; time: string; durationMinutes?: number },
): boolean {
  const durA = a.durationMinutes ?? 60;
  const durB = b.durationMinutes ?? 60;
  const toMs = (date: string, time: string) => {
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm).getTime();
  };
  const startA = toMs(a.date, a.time);
  const startB = toMs(b.date, b.time);
  if (Number.isNaN(startA) || Number.isNaN(startB)) return false;
  const endA = startA + durA * 60_000;
  const endB = startB + durB * 60_000;
  return startA < endB && startB < endA;
}

const WORK_HOURS = [10, 11, 12, 13, 14, 15, 16, 17];

/** Suggest free 60-min windows over the next `dayCount` days (skip past times today). */
export function suggestFreeWindows(
  occupied: OccupiedSlot[],
  opts?: { dayCount?: number; maxResults?: number; now?: Date },
): { date: string; time: string }[] {
  const dayCount = opts?.dayCount ?? 3;
  const maxResults = opts?.maxResults ?? 3;
  const now = opts?.now ?? new Date();
  const today = localTodayStr(now);
  const { hour: nowH, minute: nowM } = kyivClock(now);
  const results: { date: string; time: string }[] = [];

  for (let i = 0; i < dayCount && results.length < maxResults; i++) {
    const date = addDaysToDateStr(today, i);
    for (const hour of WORK_HOURS) {
      if (results.length >= maxResults) break;
      const time = `${String(hour).padStart(2, '0')}:00`;
      if (date === today) {
        if (hour < nowH || (hour === nowH && nowM > 0)) continue;
      }
      const busy = occupied.some(
        (o) =>
          o.date &&
          slotsOverlap(
            { date, time, durationMinutes: 60 },
            {
              date: o.date,
              time: o.time || '10:00',
              durationMinutes: o.durationMinutes ?? 60,
            },
          ),
      );
      if (!busy) results.push({ date, time });
    }
  }

  return results;
}

export function draftClientReplyUk(opts: {
  name: string;
  freeWindows: { date: string; time: string }[];
}): string {
  const windows = opts.freeWindows
    .map((w) => formatSlotUk(w.date, w.time))
    .join(' або ');
  if (windows) {
    return `Добрий день, ${opts.name}! Це VelvetSkin. Коли вам зручно записатися: ${windows}?`;
  }
  return `Добрий день, ${opts.name}! Це VelvetSkin. Напишіть, будь ласка, зручний день і час для візиту.`;
}
