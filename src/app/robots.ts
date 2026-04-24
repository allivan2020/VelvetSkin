import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Здесь всё верно, закрываем админку от любопытных глаз
    },
    // МЕНЯЕМ ЗДЕСЬ:
    sitemap: 'https://www.velvetskinzp.com/sitemap.xml',
  };
}
