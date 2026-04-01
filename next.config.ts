import type { NextConfig } from 'next';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self';",
      // СКРИПТЫ: Объединяем Google и Cloudflare в одну строку
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com;",
      // СТИЛИ: Добавляем шрифты Google
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      // СОЕДИНЕНИЯ: Аналитика, Cloudflare и API карт
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com;",
      // КАРТИНКИ: Аналитика + все домены Google для плиток карты
      "img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com;",
      // ФРЕЙМИ: И Cloudflare Turnstile, и Google Maps вместе
      "frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.google.com/maps/ https://maps.google.com;",
      // ШРИФТЫ
      "font-src 'self' data: https://fonts.gstatic.com;",
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  images: {
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

  reactCompiler: true,
  compress: true,
};

export default nextConfig;
