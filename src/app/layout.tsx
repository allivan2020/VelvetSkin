import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import AdminHide from '@/components/layout/AdminHide';
import { poppins, cormorant, vibes } from './fonts';
import './globals.css';
import Script from 'next/script'; // Використовуємо стандартний компонент для скриптів
import FloatingBookingButton from '@/components/ui/FloatingBookingButton';

const BookingModal = dynamic(() => import('@/components/ui/BookingModal'));

export const metadata: Metadata = {
  metadataBase: new URL('https://www.velvetskinzp.com'),
  title: 'VelvetSkin — Воскова депіляція у Запоріжжі',
  description:
    'Професійна воскова депіляція у Запоріжжі від VelvetSkin. Ідеально гладка шкіра, безпечні методики та дбайливий догляд за тілом. Записуйтесь онлайн!',
  alternates: {
    canonical: '/',
  },
  // 🔑 Верифікація для Google Search Console
  verification: {
    google: 'WyolVzA8-vajcjKkRJInYbqeR6v1tKLTp0bHdcqJnl8',
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
  telephone: '+380971950698',
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
    <html
      lang="uk"
      className={`${poppins.variable} ${cormorant.variable} ${vibes.variable}`}
    >
      <head>
        {/* 🚀 Google Tag (gtag.js) — Вставляємо прямо в head, як просить Google */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XJCXNT6D8B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XJCXNT6D8B');
          `}
        </Script>
      </head>
      <body className={`${poppins.className} relative`}>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <AdminHide>
          <Header />
        </AdminHide>

        <main className="relative">{children}</main>

        <AdminHide>
          <Footer />
          <BookingModal />
          <FloatingBookingButton />
        </AdminHide>
      </body>
    </html>
  );
}
