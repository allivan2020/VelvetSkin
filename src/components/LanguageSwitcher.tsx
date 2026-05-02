'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;

    // 1. ПРИНУДИТЕЛЬНО ОБНОВЛЯЕМ КУКУ
    // Это заставит next-intl понять, что мы действительно хотим сменить язык,
    // и предотвратит автоматический редирект обратно на предыдущий язык.
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;

    // 2. Очищаем текущий путь от старого префикса
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, '') || '/'
      : pathname;

    // 3. Формируем новый путь
    let newPath;
    if (nextLocale === 'uk') {
      // Для дефолтного украинского префикс не нужен
      newPath = pathWithoutLocale;
    } else {
      // Для ru и en добавляем префикс
      newPath =
        pathWithoutLocale === '/'
          ? `/${nextLocale}`
          : `/${nextLocale}${pathWithoutLocale}`;
    }

    startTransition(() => {
      // 4. МЕНЯЕМ URL
      router.replace(newPath);
      router.refresh();
    });
  };

  return (
    <select
      value={locale}
      onChange={onSelectChange}
      disabled={isPending}
      className="bg-transparent font-poppins text-[10px] sm:text-[11px] uppercase tracking-[1px] font-medium outline-none cursor-pointer transition-colors"
    >
      <option value="uk" className="text-black">
        Укр
      </option>
      <option value="ru" className="text-black">
        Рус
      </option>
      <option value="en" className="text-black">
        Eng
      </option>
    </select>
  );
}
