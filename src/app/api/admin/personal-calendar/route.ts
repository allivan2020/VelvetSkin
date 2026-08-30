import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse } from '@/lib/api-helpers';
import {
  assertSafeIcsUrl,
  fetchAndSyncPersonalCalendar,
  formatBusyNoteLine,
  getAppSettings,
  listUpcomingBusyBlocks,
  maskIcsUrl,
} from '@/lib/busy-calendar';

export const dynamic = 'force-dynamic';

const putSchema = z.object({
  personalIcsUrl: z.string().trim().max(2000),
});

export async function GET() {
  try {
    const settings = await getAppSettings();
    const url = settings.personalIcsUrl || '';
    const blocks = await listUpcomingBusyBlocks(50);

    return NextResponse.json({
      configured: Boolean(url),
      urlMasked: maskIcsUrl(url),
      syncedAt: settings.personalIcsSyncedAt || null,
      lastError: settings.personalIcsLastError || '',
      notes: blocks.map((b) => ({
        id: String(b._id),
        line: formatBusyNoteLine(b),
        startAt: b.startAt,
        endAt: b.endAt,
        summary: b.summary || '',
        allDay: Boolean(b.allDay),
      })),
    });
  } catch (e) {
    return errorResponse('Помилка завантаження особистого календаря', 500, e);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірний URL', 400);
    }

    const urlRaw = parsed.data.personalIcsUrl.trim();
    let url = '';
    if (urlRaw) {
      const safe = assertSafeIcsUrl(urlRaw);
      if (!safe.ok) {
        return errorResponse(safe.error, 400);
      }
      url = safe.url;
    }

    const settings = await getAppSettings();
    settings.personalIcsUrl = url;
    settings.personalIcsLastError = '';
    await settings.save();

    if (!url) {
      return NextResponse.json({
        ok: true,
        configured: false,
        urlMasked: '',
        synced: false,
        count: 0,
      });
    }

    const sync = await fetchAndSyncPersonalCalendar(url);
    if (!sync.ok) {
      settings.personalIcsLastError = sync.error || 'sync failed';
      await settings.save();
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          urlMasked: maskIcsUrl(url),
          error: sync.error,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      urlMasked: maskIcsUrl(url),
      synced: true,
      count: sync.count,
      syncedAt: new Date().toISOString(),
    });
  } catch (e) {
    return errorResponse('Помилка збереження URL', 500, e);
  }
}

export async function POST() {
  try {
    const settings = await getAppSettings();
    const url = settings.personalIcsUrl || '';
    if (!url) {
      return errorResponse('Спочатку збережіть ICS URL', 400);
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

    return NextResponse.json({
      ok: true,
      count: sync.count,
      syncedAt: new Date().toISOString(),
    });
  } catch (e) {
    return errorResponse('Помилка синхронізації', 500, e);
  }
}
