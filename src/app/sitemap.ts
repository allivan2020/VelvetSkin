import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // МЕНЯЕМ НА ОСНОВНОЙ ДОМЕН:
  const baseUrl = 'https://www.velvetskinzp.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
