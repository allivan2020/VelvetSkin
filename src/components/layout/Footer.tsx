'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-20 md:py-32 border-t border-[#bd9b7d]/10 bg-[#fdfbf7] overflow-hidden">
      {/* Едва заметный декор */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-linear-to-r from-transparent via-[#bd9b7d]/30 to-transparent" />

      <div className="container mx-auto px-[5%] flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left relative z-10">
        {/* LOGO & COPYRIGHT */}
        <div className="flex flex-col gap-4">
          <Link
            href="#hero"
            className="font-cormorant text-[28px] tracking-[2px] uppercase text-[#231d19] transition-colors duration-500 hover:text-[#bd9b7d]"
            aria-label={t('backToTop')}
          >
            Velvet
            <span className="italic font-light text-[#bd9b7d] lowercase text-[30px]">
              Skin
            </span>
          </Link>
          <div className="space-y-1">
            <p className="text-[10px] md:text-[11px] text-[#4a3f39]/40 tracking-[3px] uppercase font-light">
              © {currentYear} {t('rights')}
            </p>
            <p className="text-[9px] text-[#bd9b7d]/50 tracking-[2px] uppercase font-light">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* CATCHPHRASE: Тот самый журнальный вайб */}
        <div className="max-w-[300px]">
          <p className="font-cormorant italic text-[24px] md:text-[28px] text-[#4a3f39]/80 leading-snug">
            {t.rich('catchphrase', {
              br: () => <br className="hidden md:block" />,
              span: (chunks) => (
                <span className="text-[#bd9b7d]">{chunks}</span>
              ),
            })}
          </p>
        </div>

        {/* НАВИГАЦИЯ (Desktop) */}
        <nav className="hidden lg:flex gap-8">
          {['about', 'story', 'contacts'].map((item) => (
            <Link
              key={item}
              href={`#${item}`}
              className="text-[10px] uppercase tracking-[2px] text-[#4a3f39]/50 hover:text-[#231d19] transition-colors"
            >
              {t(`nav.${item}`)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
