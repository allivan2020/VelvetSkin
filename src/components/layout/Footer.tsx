'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BUSINESS } from '@/lib/business';

const Footer = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 md:py-24 border-t border-brand-line bg-brand-paper overflow-hidden">
      <div className="container mx-auto px-[5%] flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left relative z-10">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <Link
            href="#hero"
            title={t('backToTop')}
            className="font-cormorant text-[26px] tracking-[0.12em] uppercase text-brand-ink transition-colors duration-500 hover:text-brand-bronze"
          >
            Velvet
            <span className="italic font-light text-brand-bronze lowercase tracking-normal text-[28px]">
              Skin
            </span>
          </Link>
          <div className="space-y-1">
            <p
              suppressHydrationWarning
              className="text-[10px] md:text-[11px] text-brand-muted tracking-[0.2em] uppercase font-medium"
            >
              © {currentYear} {t('rights')}
            </p>
            <p className="text-[10px] text-brand-muted tracking-[0.18em] uppercase font-medium">
              {t('tagline')}
            </p>
            <address className="not-italic mt-4 space-y-0 text-[13px] text-brand-muted font-normal leading-relaxed">
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start min-h-11 py-2 hover:text-brand-bronze transition-colors"
              >
                {t('address')}
              </a>
              <a
                href={`tel:${BUSINESS.phoneE164}`}
                className="flex items-center justify-center md:justify-start min-h-11 py-2 hover:text-brand-bronze transition-colors"
              >
                {BUSINESS.phoneDisplay}
              </a>
              <p className="flex items-center justify-center md:justify-start min-h-11 py-2">
                {t('hours')}
              </p>
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center md:justify-start min-h-11 py-2 text-brand-bronze hover:text-brand-ink transition-colors"
              >
                {t('mapsLink')}
              </a>
            </address>
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

        <nav className="hidden lg:flex gap-2">
          {['about', 'story', 'contacts'].map((item) => (
            <Link
              key={item}
              href={`#${item}`}
              className="inline-flex items-center min-h-11 px-3 text-[11px] uppercase tracking-[0.18em] text-brand-muted hover:text-brand-ink transition-colors"
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
