import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['uk', 'ru', 'en'] as const;
type Locale = (typeof locales)[number];

// 1. Принимаем requestLocale вместо locale
export default getRequestConfig(async ({ requestLocale }) => {
  // 2. Дожидаемся распаковки параметра (требование Next.js 15)
  const locale = await requestLocale;

  // 3. Теперь locale — это нормальная строка ('ru', 'uk'), проверяем её
  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    locale,
    // Так как папка messages лежит в src, путь с одной точкой правильный
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
