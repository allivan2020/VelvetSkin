// src/app/fonts.ts
import { Poppins, Cormorant_Garamond } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500'], // Прибрали 600 та 700
  variable: '--font-poppins',
  display: 'swap',
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400'], // Для Cormorant достатньо цих двох для ефекту люксу
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});
