import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self';",
      // СКРИПТИ: додаємо Cloudflare
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://challenges.cloudflare.com;",
      // СТИЛІ: залишаємо як було
      "style-src 'self' 'unsafe-inline';",
      // З'ЄДНАННЯ: додаємо Cloudflare для валідації
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com;",
      // КАРТИНКИ: залишаємо
      "img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com;",
      // ФРЕЙМИ: Turnstile працює через iframe, це критично важливо!
      "frame-src 'self' https://challenges.cloudflare.com;",
      // ІНШЕ
      "font-src 'self' data:;",
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
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig: NextConfig = {
  // 1. Применяем заголовки безопасности (Best Practices)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  images: {
    // 2. Включаем современные форматы (Performance)
    // AVIF даст максимальное сжатие для твоих сертификатов и фото
    formats: ['image/avif', 'image/webp'],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 3. Компилятор для ускорения работы React (Performance)
  reactCompiler: true,

  // 4. Сжатие ответов сервера (Performance)
  compress: true,
};

export default nextConfig;
