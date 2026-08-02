export const ADMIN_COOKIE = 'vs_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Trim and strip wrapping quotes from env values (common Vercel/.env mistake). */
export function normalizeSecret(
  value: string | undefined | null,
): string | null {
  if (value == null) return null;
  let v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v || null;
}

function getSecret(): string | null {
  return (
    normalizeSecret(process.env.ADMIN_SESSION_SECRET) ||
    normalizeSecret(process.env.ADMIN_PASSWORD)
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  const b64 =
    typeof btoa === 'function'
      ? btoa(bin)
      : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacSign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(signature);
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error('ADMIN_PASSWORD or ADMIN_SESSION_SECRET must be set');
  }
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = `admin:${expiresAt}`;
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = await hmacSign(payload, secret);
  if (expected !== signature) return false;

  const [, expiresAtRaw] = payload.split(':');
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export function getAdminPassword(): string | null {
  return normalizeSecret(process.env.ADMIN_PASSWORD);
}

export function adminCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
