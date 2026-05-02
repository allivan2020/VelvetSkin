import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Список всех поддерживаемых языков
  locales: ['uk', 'ru', 'en'],

  // Язык по умолчанию
  defaultLocale: 'uk',

  // Если хочешь, чтобы украинский всегда был без префикса (velvetskinzp.com вместо velvetskinzp.com/uk)
  localePrefix: 'as-needed',
});

export const config = {
  // Указываем, для каких путей должна работать локализация
  // (игнорируем системные файлы Next.js, картинки, API)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
