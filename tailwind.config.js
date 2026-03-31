/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Тепер ми можемо використовувати класи типу bg-brand-bg або text-brand-primary
        brand: {
          bg: "hsl(var(--background))",
          fg: "hsl(var(--foreground))",
          primary: "hsl(var(--primary))",
          secondary: "hsl(var(--secondary))",
          accent: "hsl(var(--accent))",
        },
      },
      fontFamily: {
        // Зв'язуємо шрифти з нашими змінними з layout.tsx
        sans: ["var(--font-poppins)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;