import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center py-24">
      <p className="font-poppins text-[10px] uppercase tracking-[0.4em] text-brand-bronze mb-8">
        VelvetSkin
      </p>
      <h1 className="font-cormorant text-[clamp(2.75rem,8vw,4.5rem)] font-light leading-none mb-5 text-brand-ink">
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
  );
}
