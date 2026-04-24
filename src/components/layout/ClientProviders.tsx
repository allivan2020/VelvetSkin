'use client';

import dynamic from 'next/dynamic';

// Загружаем компоненты с выключенным SSR
const FloatingBookingButton = dynamic(
  () => import('@/components/ui/FloatingBookingButton'),
  { ssr: false },
);

const BookingModal = dynamic(() => import('@/components/ui/BookingModal'), {
  ssr: false,
});

export default function ClientProviders() {
  return (
    <>
      <BookingModal />
      <FloatingBookingButton />
    </>
  );
}
