import Link from 'next/link';
import { poppins, cormorant } from './fonts';
import './globals.css';

export default function NotFound() {
  return (
    <html lang="uk" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className={`${poppins.className} bg-brand-paper text-brand-ink antialiased`}>
        <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center">
          <p className="font-poppins text-[10px] uppercase tracking-[0.4em] text-brand-bronze mb-8">
            VelvetSkin
          </p>
          <h1 className="font-cormorant text-[clamp(2.75rem,8vw,4.5rem)] font-light leading-none mb-5">
            404
          </h1>
          <p className="font-cormorant text-xl md:text-2xl text-brand-muted font-light mb-3">
            Сторінку не знайдено
          </p>
          <p className="text-sm text-brand-soft font-light max-w-sm mb-10 leading-relaxed">
            Можливо, посилання застаріло або сторінку переміщено.
          </p>
          <Link href="/" className="btn-primary">
            На головну
          </Link>
        </main>
      </body>
    </html>
  );
}
