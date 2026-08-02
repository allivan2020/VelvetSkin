'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const Footer = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 md:py-24 border-t border-brand-line bg-brand-paper overflow-hidden">
      <div className="container mx-auto px-[5%] flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left relative z-10">
        <div className="flex flex-col gap-4">
          <Link
            href="#hero"
            className="font-cormorant text-[26px] tracking-[0.12em] uppercase text-brand-ink transition-colors duration-500 hover:text-brand-bronze"
            aria-label={t('backToTop')}
          >
            Velvet
            <span className="italic font-light text-brand-bronze lowercase tracking-normal text-[28px]">
              Skin
            </span>
          </Link>
          <div className="space-y-1">
            <p
              suppressHydrationWarning
              className="text-[10px] md:text-[11px] text-brand-soft tracking-[0.2em] uppercase font-light"
            >
              © {currentYear} {t('rights')}
            </p>
            <p className="text-[9px] text-brand-bronze/60 tracking-[0.18em] uppercase font-light">
              {t('tagline')}
            </p>
          </div>
        </div>

        <div className="max-w-[300px]">
          <p className="font-cormorant italic text-[22px] md:text-[26px] text-brand-muted leading-snug font-light">
            {t.rich('catchphrase', {
              br: () => <br className="hidden md:block" />,
              span: (chunks) => (
                <span className="text-brand-bronze not-italic">{chunks}</span>
              ),
            })}
          </p>
        </div>

        <nav className="hidden lg:flex gap-8">
          {['about', 'story', 'contacts'].map((item) => (
            <Link
              key={item}
              href={`#${item}`}
              className="text-[10px] uppercase tracking-[0.18em] text-brand-soft hover:text-brand-ink transition-colors"
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
