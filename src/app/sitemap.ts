import { MetadataRoute } from 'next';
import { locales, localePath } from '@/lib/locales';
import { BUSINESS } from '@/lib/business';

export default function sitemap(): MetadataRoute.Sitemap {
  // Stable lastModified for crawl consistency (update when content meaningfully changes).
  const lastModified = new Date('2026-09-08T00:00:00.000Z');

  return locales.map((locale) => ({
    url: `${BUSINESS.baseUrl}${localePath(locale) === '/' ? '' : localePath(locale)}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: locale === 'uk' ? 1.0 : 0.8,
  }));
}
