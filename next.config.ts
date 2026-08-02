import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com https://va.vercel-scripts.com;",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com https://challenges.cloudflare.com https://maps.googleapis.com https://va.vercel-scripts.com https://stats.g.doubleclick.net https://www.google.com https://*.google.com https://*.google.com.ua;",
      "img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com https://www.google.com https://www.google.com.ua https://stats.g.doubleclick.net https://*.google.com https://*.google.com.ua;",
      "frame-src 'self' https://challenges.cloudflare.com https://www.google.com;",
      "font-src 'self' data: https://fonts.gstatic.com;",
      "trusted-types goog#html nextjs#vitals nextjs#bundler cloudflare-turnstile-policy 'allow-duplicates';",
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
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    qualities: [70, 75, 80, 90],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'maps.gstatic.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
  },
  experimental: { reactCompiler: true },
  compress: true,
};

export default withNextIntl(nextConfig);
