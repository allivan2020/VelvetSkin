import type { ReactNode } from 'react';

/** Required root layout for App Router + next-intl ([locale] holds html/body). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
