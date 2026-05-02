import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import AdminHide from '@/components/layout/AdminHide';
import { poppins, cormorant, vibes } from '../fonts';
import '../globals.css';
import Script from 'next/script';
import ClientProviders from '@/components/layout/ClientProviders';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  // Метаданные пока оставляем как есть.
  // На 5-м этапе мы сделаем их динамическими для разных языков!
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

// 1. Делаем функцию async и добавляем типизацию для params
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // <-- 1. Указываем, что это Promise
}) {
  // 2. Явно дожидаемся распаковки параметров
  const { locale } = await params;

  // 3. Дальше всё как раньше
  const messages = await getMessages();

  return (
    <html
      lang={locale}
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

        {/* 4. Оборачиваем ВЕСЬ контент в провайдер переводов */}
        <NextIntlClientProvider messages={messages}>
          <AdminHide>
            <Header />
          </AdminHide>

          <main className="relative">{children}</main>

          <AdminHide>
            <Footer />
            <ClientProviders />
          </AdminHide>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
