'use client';

import dynamic from 'next/dynamic';

// Вот здесь мы переносим динамический импорт в КЛИЕНТСКИЙ компонент
const FloatingBookingButton = dynamic(() => import('./FloatingBookingButton'), {
  ssr: false,
});

export default function FloatingButtonSafe() {
  return <FloatingBookingButton />;
}
