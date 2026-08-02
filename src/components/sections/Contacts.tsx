'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const Contacts = () => {
  const t = useTranslations('Contacts');
  const [showMap, setShowMap] = useState(false);

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
                <p className="font-cormorant text-2xl md:text-[1.75rem] text-brand-ink font-normal">
                  {t('address')}
                </p>
              </div>

              <div>
                <span className="block text-[10px] uppercase text-brand-bronze mb-3 tracking-[0.25em] font-medium">
                  {t('labels.phone')}
                </span>
                <a
                  href="tel:+380971950698"
                  className="font-cormorant text-2xl md:text-[1.75rem] text-brand-ink font-normal hover:text-brand-bronze transition-colors duration-500"
                >
                  +38 (097) 195 06 98
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
              {['Instagram', 'Telegram'].map((social) => (
                <a
                  key={social}
                  href={
                    social === 'Instagram'
                      ? 'https://www.instagram.com/velvetskin.zp/'
                      : 'https://t.me/velvetskinzp/'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-8 py-3"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="relative h-[420px] md:h-[560px] w-full rounded-[28px] overflow-hidden border border-brand-line bg-brand-line/40 max-lg:order-1">
            {!showMap ? (
              <div
                className="relative w-full h-full cursor-pointer group"
                onClick={() => setShowMap(true)}
              >
                <Image
                  src="/img/map-placeholder-large.avif"
                  alt={t('map.alt')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-brand-ink/25 group-hover:bg-brand-ink/40 transition-colors duration-500 flex items-center justify-center">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass px-9 py-3.5 text-brand-ink text-[11px] uppercase tracking-[0.2em] font-medium rounded-full"
                  >
                    {t('map.button')}
                  </motion.button>
                </div>
              </div>
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2678.43573!2d35.15546!3d47.83155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40dc67389658e653%3A0x673070440628325b!2z0YPQuy4g0KPQutGA0LDQuNC90YHQutCw0Y8sIDQzLCDQl9Cw0L_QvtGA0L7QttGM0LUsINCX0LDQv9C-0YDQvtC20YHQutCw0Y8g0L7QsdC70LDRgdGC0YwsIDY5MDAw!5e0!3m2!1sru!2sua!4v1715000000000!5m2!1sru!2sua"
                width="100%"
                height="100%"
                title={t('map.title')}
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="animate-fade-in grayscale-[0.25] contrast-[1.05]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
