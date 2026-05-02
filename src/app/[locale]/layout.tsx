import { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import AdminHide from '@/components/layout/AdminHide';
import { poppins, cormorant, vibes } from '../fonts';
import '../globals.css';
import ClientProviders from '@/components/layout/ClientProviders';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
// 1. Импортируем новый оптимизированный компонент
import { GoogleTagManager } from '@next/third-parties/google';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  return {
    metadataBase: new URL(baseUrl),
    verification: {
      google: 'WyolVzA8-vajcjKkRJInYbqeR6v1tKLTp0bHdcqJnl8',
    },
    // Добавляем fallback (значение по умолчанию), чтобы Google не видел пустоту
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
    url: `https://www.velvetskinzp.com/${locale}`,
  };

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${cormorant.variable} ${vibes.variable}`}
    >
      <body className={`${poppins.className} relative`}>
        {/* 2. Вставляем новый GoogleTagManager сразу после <body> */}
        {/* Это ОЧЕНЬ сильно разгрузит основной поток (Performance) */}
        <GoogleTagManager gtmId="G-XJCXNT6D8B" />

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
      </body>
    </html>
  );
}
