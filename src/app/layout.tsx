// src/app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import BookingModal from '@/components/ui/BookingModal'; // <-- 1. ИМПОРТИРУЕМ МОДАЛКУ
import { poppins, cormorant } from './fonts';
import './globals.css';

// 1. ПЕРЕНОСИМ SEO ИЗ ТВОЕГО HTML
export const metadata: Metadata = {
  metadataBase: new URL('https://epil-story.vercel.app'), // <-- Добавлено
  title: 'VelvetSkin — Воскова депіляція у Запоріжжі',
  description:
    'Професійна воскова депіляція у Запоріжжі від VelvetSkin. Ідеально гладка шкіра, безпечні методики та дбайливий догляд за тілом. Записуйтесь онлайн!',
  alternates: {
    canonical: 'https://epil-story.vercel.app/',
  },
  openGraph: {
    title: 'VelvetSkin — Твоя історія ідеально гладкої шкіри',
    description:
      'Професійна воскова депіляція у Запоріжжі. Дбайливий догляд, якому довіряють.',
    url: 'https://epil-story.vercel.app/',
    siteName: 'VelvetSkin',
    images: [
      {
        url: '/og-preview.png', // Файл должен лежать в public/
        width: 1200,
        height: 630,
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
};

// 2. ПЕРЕНОСИМ МИКРОРАЗМЕТКУ (JSON-LD)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'VelvetSkin',
  description: 'Студія професійної воскової депіляції у Запоріжжі.',
  image: 'https://epil-story.vercel.app/og-preview.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'вул. Українська, 43',
    addressLocality: 'Запоріжжя',
    postalCode: '69000',
    addressCountry: 'UA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '47.8223',
    longitude: '35.1764',
  },
  url: 'https://epil-story.vercel.app',
  telephone: '+380685740490',
  priceRange: '$$',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={`${poppins.variable} ${cormorant.variable}`}>
      <head>
        {/* Вставляем микроразметку прямо в head */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={poppins.className}>
        {/* 3. ГУГЛ АНАЛИТИКА (Переносим твой G-XXXXXXXXXX) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        <Header />
        <main>{children}</main>
        <Footer />
        <BookingModal />
      </body>
    </html>
  );
}
