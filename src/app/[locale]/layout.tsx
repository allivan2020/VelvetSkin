import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdminHide from '@/components/layout/AdminHide';
import ClientProviders from '@/components/layout/ClientProviders';

import { poppins, cormorant, vibes } from '../fonts';
import '../globals.css';

const baseUrl = 'https://www.velvetskinzp.com';

const titles: Record<string, string> = {
  uk: 'VelvetSkin — Воскова депіляція Запоріжжя | Записатись онлайн',
  ru: 'VelvetSkin — Восковая депиляция Запорожье | Записаться онлайн',
  en: 'VelvetSkin — Professional Waxing in Zaporizhzhia | Book Online',
};

const descriptions: Record<string, string> = {
  uk: 'Професійна воскова депіляція у Запоріжжі від VelvetSkin. Ідеально гладенька шкіра, преміальні матеріали та комфорт.',
  ru: 'Профессиональная восковая депиляция в Запорожье от VelvetSkin. Идеально гладкая кожа и комфорт.',
  en: 'Professional waxing in Zaporizhzhia by VelvetSkin. Flawless skin and premium products.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return {
    metadataBase: new URL(baseUrl),
    verification: {
      google: 'WyolVzA8-vajcjKkRJInYbqeR6v1tKLTp0bHdcqJnl8',
    },
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,

    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'uk-UA': `${baseUrl}/uk`,
        'ru-RU': `${baseUrl}/ru`,
        'en-US': `${baseUrl}/en`,
        'x-default': `${baseUrl}/uk`,
      },
    },

    openGraph: {
      title: titles[locale] || titles.uk,
      description: descriptions[locale] || descriptions.uk,
      url: `${baseUrl}/${locale}`,
      siteName: 'VelvetSkin',
      images: [{ url: '/og-preview.png', width: 1200, height: 630 }],
      locale: locale === 'en' ? 'en_US' : locale === 'ru' ? 'ru_RU' : 'uk_UA',
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

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
    url: `${baseUrl}/${locale}`,
  };

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${cormorant.variable} ${vibes.variable}`}
      suppressHydrationWarning
    >
      <GoogleTagManager gtmId="GTM-MKRCDF8N" />
      <body className={`${poppins.className} relative`}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { zIndex: 99999 },
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

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

        <SpeedInsights />
        <Analytics />
        <GoogleAnalytics gaId="G-XJCXNT6D8B" />
      </body>
    </html>
  );
}
