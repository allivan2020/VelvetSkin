import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { sendMasterDigestTelegram } from '@/lib/reminders';

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

/** Vercel Cron / manual: morning digest to master Telegram. */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendMasterDigestTelegram();
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, reason: result.reason },
        { status: 502 },
      );
    }
    return NextResponse.json({
      ok: true,
      today: result.data.today.length,
      tomorrow: result.data.tomorrow.length,
    });
  } catch (e) {
    console.error('Cron reminders error:', e);
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
