import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = process.env.CALENDAR_FEED_TOKEN?.trim() || '';
  const configured = token.length >= 16;

  if (!configured) {
    return NextResponse.json({
      configured: false,
      httpsUrl: '',
      webcalUrl: '',
    });
  }

  const publicBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
  const requestHost = req.nextUrl.hostname;
  const isLocalDev =
    requestHost === 'localhost' ||
    requestHost === '127.0.0.1' ||
    process.env.NODE_ENV === 'development';

  // Local admin must not advertise production webcal — Mac Calendar would hit
  // prod (often 404 before deploy). Prefer request origin while developing.
  const origin =
    isLocalDev
      ? req.nextUrl.origin
      : publicBase && /^https?:\/\//i.test(publicBase)
        ? publicBase
        : req.nextUrl.origin;

  const httpsUrl = `${origin}/api/calendar/feed?token=${encodeURIComponent(token)}`;
  // Apple Calendar: webcal:// → http(s). Keep http for localhost (TLS absent).
  const webcalUrl = httpsUrl.startsWith('https:')
    ? httpsUrl.replace(/^https:/i, 'webcal:')
    : httpsUrl.replace(/^http:/i, 'webcal:');

  return NextResponse.json({
    configured: true,
    httpsUrl,
    webcalUrl,
    // Hint for UI: local subscribe only works on this Mac while `next dev` runs.
    localOnly: isLocalDev,
  });
}
