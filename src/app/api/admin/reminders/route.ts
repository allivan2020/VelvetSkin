import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-helpers';
import { loadReminders, sendMasterDigestTelegram } from '@/lib/reminders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await loadReminders();
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse('Помилка нагадувань', 500, e);
  }
}

/** Send today+tomorrow digest to salon Telegram (master only). */
export async function POST() {
  try {
    const result = await sendMasterDigestTelegram();
    if (!result.ok) {
      return errorResponse(`Telegram: ${result.reason}`, 502);
    }
    return NextResponse.json({ ok: true, ...result.data });
  } catch (e) {
    return errorResponse('Помилка відправки нагадування', 500, e);
  }
}
