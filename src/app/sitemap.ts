import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.velvetskinzp.com';
  const locales = ['uk', 'ru', 'en'];

  // Генерируем пути для всех языков
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: locale === 'uk' ? 1.0 : 0.8,
  }));
}
