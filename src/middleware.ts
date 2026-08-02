import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/lib/locales';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/auth';

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'as-needed',
});

function isAdminLoginPath(pathname: string): boolean {
  return (
    pathname === '/admin/login' ||
    pathname === '/uk/admin/login' ||
    /^\/(ru|en)\/admin\/login\/?$/.test(pathname)
  );
}

function isAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    /^\/(uk|ru|en)\/admin(\/|$)/.test(pathname)
  );
}

function adminDashboardPath(pathname: string): string {
  const localeMatch = pathname.match(/^\/(ru|en)(\/|$)/);
  return localeMatch ? `/${localeMatch[1]}/admin` : '/admin';
}

function adminLoginPath(pathname: string): string {
  const localeMatch = pathname.match(/^\/(ru|en)(\/|$)/);
  return localeMatch ? `/${localeMatch[1]}/admin/login` : '/admin/login';
}

async function hasValidAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never run next-intl on API routes
  if (pathname.startsWith('/api/')) {
    const isProtectedAdminApi =
      pathname.startsWith('/api/admin') || pathname.startsWith('/api/clients');
    const isLegacyPublicLeadPost =
      pathname === '/api/admin/leads' && req.method === 'POST';

    if (isProtectedAdminApi && !isLegacyPublicLeadPost) {
      const ok = await hasValidAdminSession(req);
      if (!ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.next();
  }

  if (isAdminPath(pathname)) {
    const ok = await hasValidAdminSession(req);

    if (isAdminLoginPath(pathname)) {
      if (ok) {
        const dash = req.nextUrl.clone();
        dash.pathname = adminDashboardPath(pathname);
        return NextResponse.redirect(dash);
      }
      return intlMiddleware(req);
    }

    if (!ok) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = adminLoginPath(pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
