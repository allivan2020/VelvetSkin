import { MetadataRoute } from 'next';
import { locales, localePath } from '@/lib/locales';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.velvetskinzp.com';

  return locales.map((locale) => ({
    url: `${baseUrl}${localePath(locale)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: locale === 'uk' ? 1.0 : 0.8,
  }));
}
