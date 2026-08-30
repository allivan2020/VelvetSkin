import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Client from '@/models/Client';
import { buildIcsCalendar } from '@/lib/appointments';
import { timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';

function tokensMatch(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const expected = process.env.CALENDAR_FEED_TOKEN?.trim();
  if (!expected || expected.length < 16) {
    return NextResponse.json(
      { error: 'Calendar feed is not configured' },
      { status: 503 },
    );
  }

  const token = req.nextUrl.searchParams.get('token') || '';
  if (!tokensMatch(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const clients = await Client.find({
      nextAppointment: { $exists: true, $nin: [null, ''] },
    })
      .select(
        'name phone nextAppointment nextAppointmentTime nextAppointmentService',
      )
      .lean();

    const events = clients.map((c) => {
      const id = String(c._id);
      const time = c.nextAppointmentTime || '10:00';
      const service = c.nextAppointmentService || '';
      return {
        uid: `velvetskin-${id}@velvetskinzp.com`,
        summary: `VelvetSkin: ${c.name}`,
        description: [
          c.phone ? `Тел: ${c.phone}` : '',
          service ? `Послуга: ${service}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        date: c.nextAppointment as string,
        time,
        durationMinutes: 60,
      };
    });

    const ics = buildIcsCalendar(events, 'VelvetSkin CRM');

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="velvetskin.ics"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (e) {
    console.error('Calendar feed error:', e);
    return NextResponse.json({ error: 'Feed error' }, { status: 500 });
  }
}
