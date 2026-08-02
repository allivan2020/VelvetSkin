import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  getAdminPassword,
} from '@/lib/auth';
import { errorResponse, getClientIp, rateLimit } from '@/lib/api-helpers';
import { adminLoginSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limited = rateLimit(`admin-login:${ip}`, 8, 60_000);
    if (!limited.ok) {
      return errorResponse('Забагато спроб. Спробуйте пізніше.', 429);
    }

    const expected = getAdminPassword();
    if (!expected) {
      return errorResponse('Адмін-пароль не налаштовано', 500);
    }

    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірні дані', 400);
    }

    if (parsed.data.password !== expected) {
      return errorResponse('Невірний пароль', 401);
    }

    const token = await createAdminSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
    return response;
  } catch (e) {
    return errorResponse('Помилка входу', 500, e);
  }
}
