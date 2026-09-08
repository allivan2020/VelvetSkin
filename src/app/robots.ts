import { MetadataRoute } from 'next';
import { BUSINESS } from '@/lib/business';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/ru/admin', '/en/admin'],
    },
    sitemap: `${BUSINESS.baseUrl}/sitemap.xml`,
    host: BUSINESS.baseUrl,
  };
}
