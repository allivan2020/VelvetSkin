import { NextResponse } from 'next/server';
import { verifyAdminSessionToken, ADMIN_COOKIE } from '@/lib/auth';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function errorResponse(
  message: string,
  status: number,
  error?: unknown,
) {
  if (error) {
    console.error(`[API ERROR] ${message}:`, error);
  }

  const body: { error: string; details?: string } = { error: message };

  if (process.env.NODE_ENV !== 'production' && error !== undefined) {
    body.details = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(body, { status });
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

/** Best-effort in-memory rate limit (per serverless instance). */
export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = rateBuckets.get(key);

  if (!existing || now > existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true };
}

export async function verifyTurnstile(token: string | undefined | null) {
  if (!token) {
    return { ok: false as const, error: 'Капча відсутня' };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not configured');
    return { ok: false as const, error: 'Капча недоступна' };
  }

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    },
  );

  const data = (await response.json()) as { success?: boolean };
  if (!data.success) {
    return { ok: false as const, error: 'Капча не пройдена' };
  }

  return { ok: true as const };
}

export async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]*)`),
  );
  const token = match?.[1] ? decodeURIComponent(match[1]) : null;
  const valid = await verifyAdminSessionToken(token);
  if (!valid) {
    return errorResponse('Unauthorized', 401);
  }
  return null;
}

export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    }),
  }).catch((err) => console.error('Telegram Notify Error:', err));
}
