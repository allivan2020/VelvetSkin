import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import AdminHide from '@/components/layout/AdminHide';
import { poppins, cormorant, vibes } from './fonts';
import './globals.css';
import Script from 'next/script';
import ClientProviders from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.velvetskinzp.com'),
  title: 'VelvetSkin — Воскова депіляція Запоріжжя | Записатись онлайн',
  description: 'Професійна воскова депіляція у Запоріжжі від VelvetSkin...',
  alternates: { canonical: '/' },
  verification: { google: 'WyolVzA8-vajcjKkRJInYbqeR6v1tKLTp0bHdcqJnl8' },
  openGraph: {
    title: 'VelvetSkin — Твоя історія ідеально гладкої шкіри',
    description: 'Професійна воскова депіляція у Запоріжжі.',
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
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'вул. Українська, 43',
    addressLocality: 'Запоріжжя',
    addressCountry: 'UA',
  },
  telephone: '+380971950698',
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
          {/* ✅ ВОТ ТУТ ОДНА ОБЕРТКА ДЛЯ ВСЕГО КЛИЕНТСКОГО.
             Удали отсюда <BookingModal /> и <FloatingBookingButton /> 
          */}
          <ClientProviders />
        </AdminHide>
      </body>
    </html>
  );
}
