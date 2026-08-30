import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAndSyncPersonalCalendar,
  getAppSettings,
} from '@/lib/busy-calendar';

export const dynamic = 'force-dynamic';

function secretsMatch(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function authorizeCron(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected || expected.length < 16) return false;
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  return secretsMatch(bearer, expected);
}

/** Hourly sync of personal iPhone/Google ICS into BusyBlock. */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getAppSettings();
    const url = settings.personalIcsUrl || '';
    if (!url) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'no_url' });
    }

    const sync = await fetchAndSyncPersonalCalendar(url);
    if (!sync.ok) {
      settings.personalIcsLastError = sync.error || 'sync failed';
      await settings.save();
      return NextResponse.json(
        { ok: false, error: sync.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, count: sync.count });
  } catch (e) {
    console.error('Cron busy-sync error:', e);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
