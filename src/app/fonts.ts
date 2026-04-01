import { Poppins, Cormorant_Garamond, Great_Vibes } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false,
});

export const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});

// Додаємо рукописний шрифт для акцентів
export const vibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vibes',
  display: 'swap',
  preload: false,
});
