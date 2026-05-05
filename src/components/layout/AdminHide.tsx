'use client'; // Обязательно клиентский компонент, так как нам нужен доступ к текущему URL

import { usePathname } from 'next/navigation';

export default function AdminHide({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Проверяем, включает ли путь слово /admin.
  // Это покроет варианты /admin, /ru/admin, /uk/admin, /en/admin/dashboard и т.д.
  const isAdminPage = pathname.includes('/admin');

  if (isAdminPage) {
    return null; // Если это админка, возвращаем пустоту (хедер и футер скрываются)
  }

  return <>{children}</>; // Если это обычная страница, рендерим переданный хедер/футер
}
