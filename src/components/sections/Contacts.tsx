'use client';

import { useLocale, useTranslations } from 'next-intl';
import { BUSINESS, mapsEmbedUrl } from '@/lib/business';

const Contacts = () => {
  const t = useTranslations('Contacts');
  const locale = useLocale();

  return (
    <section
      id="contacts"
      className="relative py-32 md:py-44 bg-brand-paper overflow-hidden"
    >
      <div className="container mx-auto px-[5%] max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">
          <div className="text-left max-lg:text-center max-lg:order-2">
            <p className="section-eyebrow">{t('subtitle')}</p>

            <h2 className="section-title mb-12">
              {t.rich('title', {
                br: () => <br className="hidden md:block" />,
                span: (chunks) => (
                  <span className="section-title-accent">{chunks}</span>
                ),
              })}
            </h2>

            <address className="not-italic space-y-10">
              <div>
                <span className="block text-[10px] uppercase text-brand-bronze mb-3 tracking-[0.25em] font-medium">
                  {t('labels.location')}
                </span>
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-cormorant text-2xl md:text-[1.75rem] text-brand-ink font-normal hover:text-brand-bronze transition-colors duration-500"
                >
                  {t('address')}
                </a>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-brand-bronze mb-3 tracking-[0.25em] font-medium">
                  {t('labels.phone')}
                </span>
                <a
                  href={`tel:${BUSINESS.phoneE164}`}
                  className="font-cormorant text-2xl md:text-[1.75rem] text-brand-ink font-normal hover:text-brand-bronze transition-colors duration-500"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-brand-bronze mb-3 tracking-[0.25em] font-medium">
                  {t('labels.hours')}
                </span>
                <p className="font-cormorant text-2xl md:text-[1.75rem] text-brand-ink font-normal">
                  {t('hours')}
                </p>
              </div>
            </address>

            <div className="mt-14 flex flex-wrap gap-4 max-lg:justify-center">
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-8 py-3"
              >
                {t('map.openInGoogle')}
              </a>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-8 py-3"
              >
                Instagram
              </a>
              <a
                href={BUSINESS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-8 py-3"
              >
                Telegram
              </a>
            </div>
          </div>

          <div className="relative h-[420px] md:h-[560px] w-full rounded-[28px] overflow-hidden border border-brand-line bg-brand-line/40 max-lg:order-1">
            <iframe
              src={mapsEmbedUrl(locale)}
              width="100%"
              height="100%"
              title={t('map.title')}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.25] contrast-[1.05]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
