import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self';",
      // СКРИПТЫ: Добавляем 'unsafe-inline' и 'unsafe-eval' (для Next.js и Cloudflare), а также домены Vercel
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com https://va.vercel-scripts.com;",
      // СТИЛИ: Шрифты + инлайновые стили (нужны для анимаций Framer Motion)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      // СОЕДИНЕНИЯ: Аналитика, API и Vercel
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com https://va.vercel-scripts.com;",
      // КАРТИНКИ: Разрешаем blob и data для карт и оптимизированных изображений
      "img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com;",
      // ФРЕЙМЫ: Важно для работы Turnstile и Карт
      "frame-src 'self' https://challenges.cloudflare.com https://www.google.com;",
      // ШРИФТЫ
      "font-src 'self' data: https://fonts.gstatic.com;",
      // TRUSTED TYPES: Чтобы убрать ошибки из консоли и разрешить Cloudflare работать
      'trusted-types goog#html nextjs#vitals cloudflare-turnstile-policy; allow-duplicates;',
      "object-src 'none';",
      "base-uri 'self';",
      "form-action 'self';",
      "frame-ancestors 'none';",
      'upgrade-insecure-requests;',
    ].join(' '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    qualities: [70, 75, 80, 90],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: { reactCompiler: true },
  compress: true,
};

export default withNextIntl(nextConfig);
