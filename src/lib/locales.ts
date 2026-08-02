export const locales = ['uk', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Locale-aware path for sitemap/canonical (uk has no prefix with as-needed). */
export function localePath(locale: string, path = ''): string {
  const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
  if (locale === defaultLocale) return normalized || '/';
  return `/${locale}${normalized}`;
}
