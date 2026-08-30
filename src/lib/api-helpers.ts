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

export type NotifyTelegramResult =
  | { ok: true }
  | { ok: false; reason: string };

const TELEGRAM_TIMEOUT_MS = 8_000;
const TELEGRAM_MAX_ATTEMPTS = 3;
/** Telegram Bot API hard limit for sendMessage text. */
const TELEGRAM_MAX_TEXT = 4096;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reliable Telegram notify for serverless:
 * timeout, retries, response validation. Always await before returning
 * from a route — fire-and-forget is dropped when the isolate freezes.
 */
export async function notifyTelegram(
  text: string,
): Promise<NotifyTelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    console.error(
      '[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured',
    );
    return { ok: false, reason: 'not_configured' };
  }

  const safeText = String(text ?? '').slice(0, TELEGRAM_MAX_TEXT).trim();
  if (!safeText) {
    return { ok: false, reason: 'empty_message' };
  }

  let lastReason = 'unknown';

  for (let attempt = 1; attempt <= TELEGRAM_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: safeText,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
        },
      );

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        description?: string;
        error_code?: number;
      } | null;

      if (response.ok && data?.ok === true) {
        return { ok: true };
      }

      const description =
        data?.description || `HTTP ${response.status}`;
      lastReason = description;

      const retryable =
        response.status === 429 ||
        response.status >= 500 ||
        data?.error_code === 429;

      console.error(
        `[Telegram] send failed attempt ${attempt}/${TELEGRAM_MAX_ATTEMPTS}:`,
        description,
      );

      if (!retryable || attempt === TELEGRAM_MAX_ATTEMPTS) {
        return { ok: false, reason: description };
      }

      await sleep(attempt * 500);
    } catch (err) {
      lastReason =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'timeout'
            : err.message
          : String(err);

      console.error(
        `[Telegram] network error attempt ${attempt}/${TELEGRAM_MAX_ATTEMPTS}:`,
        lastReason,
      );

      if (attempt === TELEGRAM_MAX_ATTEMPTS) {
        return { ok: false, reason: lastReason };
      }

      await sleep(attempt * 500);
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, reason: lastReason };
}
