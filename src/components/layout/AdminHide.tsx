'use client';

import { usePathname } from 'next/navigation';

export default function AdminHide({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // Якщо ми в адмінці, нічого не рендеримо
  if (isAdmin) return null;

  // Якщо ми на звичайному сайті, показуємо Header/Footer
  return <>{children}</>;
}
