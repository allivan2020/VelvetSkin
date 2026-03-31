import type { Metadata } from 'next';
import { GoogleTagManager } from '@next/third-parties/google'; // Оптимальный способ для Performance
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import BookingModal from '@/components/ui/BookingModal';
import { poppins, cormorant } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  // 1. Указываем твой КУПЛЕННЫЙ домен
  metadataBase: new URL('https://www.velvetskinzp.com'),
  title: 'VelvetSkin — Воскова депіляція у Запоріжжі',
  description:
    'Професійна воскова депіляція у Запоріжжі від VelvetSkin. Ідеально гладка шкіра, безпечні методики та дбайливий догляд за тілом. Записуйтесь онлайн!',
  alternates: {
    canonical: 'https://www.velvetskinzp.com/',
  },
  openGraph: {
    title: 'VelvetSkin — Твоя історія ідеально гладкої шкіри',
    description:
      'Професійна воскова депіляція у Запоріжжі. Дбайливий догляд, якому довіряють.',
    url: 'https://www.velvetskinzp.com/',
    siteName: 'VelvetSkin',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'VelvetSkin Запоріжжя',
      },
    ],
    locale: 'uk_UA',
    type: 'website',
  },
};

// 2. JSON-LD: Синхронизировал телефон с твоим компонентом Contacts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'VelvetSkin',
  description: 'Студія професійної воскової депіляції у Запоріжжі.',
  image: 'https://www.velvetskinzp.com/og-preview.png',
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
  url: 'https://www.velvetskinzp.com',
  telephone: '+380971950698', // Обновил на номер из твоих контактов
  priceRange: '₴₴',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '09:00',
      closes: '20:00',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={`${poppins.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={poppins.className}>
        {/* 3. Оптимизированная аналитика (не блокирует рендер) */}
        <GoogleTagManager gtmId="G-XXXXXXXXXX" />

        <Header />
        <main>{children}</main>
        <Footer />
        <BookingModal />
      </body>
    </html>
  );
}
