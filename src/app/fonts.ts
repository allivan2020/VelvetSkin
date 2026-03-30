// src/app/fonts.ts
import { Poppins, Great_Vibes } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins', // CSS-переменная для Tailwind
  display: 'swap',
});

export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-great-vibes', // CSS-переменная для Tailwind
  display: 'swap',
});
