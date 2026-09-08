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
import { localePath } from '@/lib/locales';
import { BUSINESS, beautySalonJsonLd } from '@/lib/business';

const baseUrl = BUSINESS.baseUrl;

const titles: Record<string, string> = {
  uk: 'VelvetSkin — Воскова депіляція Запоріжжя | Записатись онлайн',
  ru: 'VelvetSkin — Восковая депиляция Запорожье | Записаться онлайн',
  en: 'VelvetSkin — Professional Waxing in Zaporizhzhia | Book Online',
};

const descriptions: Record<string, string> = {
  uk: 'VelvetSkin — воскова депіляція в Запоріжжі (вул. Українська, 43). Щодня 08:00–19:00. Запис: +38 (097) 195 06 98.',
  ru: 'VelvetSkin — восковая депиляция в Запорожье (ул. Украинская, 43). Ежедневно 08:00–19:00. Запись: +38 (097) 195 06 98.',
  en: 'VelvetSkin — waxing in Zaporizhzhia (Ukrainska St, 43). Open daily 08:00–19:00. Book: +38 (097) 195 06 98.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const canonicalPath = localePath(locale);
  const canonicalUrl = `${baseUrl}${canonicalPath === '/' ? '' : canonicalPath}`;

  const title = titles[locale] || titles.uk;
  const description = descriptions[locale] || descriptions.uk;

  return {
    metadataBase: new URL(baseUrl),
    verification: {
      google: 'WyolVzA8-vajcjKkRJInYbqeR6v1tKLTp0bHdcqJnl8',
    },
    title,
    description,
    robots: { index: true, follow: true },

    alternates: {
      canonical: canonicalUrl || baseUrl,
      languages: {
        'uk-UA': baseUrl,
        'ru-RU': `${baseUrl}/ru`,
        'en-US': `${baseUrl}/en`,
        'x-default': baseUrl,
      },
    },

    openGraph: {
      title,
      description,
      url: canonicalUrl || baseUrl,
      siteName: BUSINESS.name,
      images: [
        {
          url: BUSINESS.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale === 'en' ? 'en_US' : locale === 'ru' ? 'ru_RU' : 'uk_UA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [BUSINESS.ogImage],
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

  const jsonLd = beautySalonJsonLd(descriptions[locale] || descriptions.uk);

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${cormorant.variable} ${vibes.variable}`}
      suppressHydrationWarning
    >
      <body className={`${poppins.className} relative`}>
        <GoogleTagManager gtmId="GTM-MKRCDF8N" />
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
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[10000] focus:bg-white focus:text-[#231d19] focus:px-4 focus:py-2 focus:rounded-lg"
          >
            Skip to content
          </a>
          <AdminHide>
            <Header />
          </AdminHide>

          <main id="main-content" className="relative">
            {children}
          </main>

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
