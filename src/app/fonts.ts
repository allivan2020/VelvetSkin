import { Poppins, Cormorant_Garamond, Great_Vibes } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap', // ОБЯЗАТЕЛЬНО
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap', // ОБЯЗАТЕЛЬНО
});

export const vibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vibes',
  display: 'swap', // ОБЯЗАТЕЛЬНО
});
