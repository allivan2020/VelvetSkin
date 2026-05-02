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
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      {/* Мягкий световой акцент */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#bd9b7d]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-[5%] max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* ИНФОРМАЦИЯ */}
          <div className="text-left max-lg:text-center max-lg:order-2">
            <p className="text-[#917152] uppercase tracking-[6px] text-[10px] md:text-[11px] mb-6 font-semibold">
              {t('subtitle')}
            </p>

            <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9] mb-12">
              {t.rich('title', {
                br: () => <br className="hidden md:block" />,
                span: (chunks) => (
                  <span className="text-[#917152]">{chunks}</span>
                ),
              })}
            </h2>

            <address className="not-italic space-y-12">
              <div className="group">
                <span className="block text-[10px] uppercase text-[#917152] mb-3 tracking-[3px] font-bold">
                  {t('labels.location')}
                </span>
                <p className="font-cormorant text-2xl md:text-3xl text-[#1a1614] font-medium">
                  {t('address')}
                </p>
              </div>

              <div className="group">
                <span className="block text-[10px] uppercase text-[#917152] mb-3 tracking-[3px] font-bold">
                  {t('labels.phone')}
                </span>
                <a
                  href="tel:+380971950698"
                  className="font-cormorant text-2xl md:text-3xl text-[#1a1614] font-medium hover:text-[#917152] transition-colors duration-500"
                >
                  +38 (097) 195 06 98
                </a>
              </div>

              <div className="group">
                <span className="block text-[10px] uppercase text-[#917152] mb-3 tracking-[3px] font-bold">
                  {t('labels.hours')}
                </span>
                <p className="font-cormorant text-2xl md:text-3xl text-[#1a1614] font-medium">
                  {t('hours')}
                </p>
              </div>
            </address>

            {/* Социальные сети */}
            <div className="mt-16 flex flex-wrap gap-6 max-lg:justify-center">
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
                  className="px-10 py-3.5 border border-[#1a1614]/20 rounded-full text-[#1a1614] text-[10px] uppercase tracking-[2px] font-bold hover:bg-[#1a1614] hover:text-[#fdfbf7] transition-all duration-500"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* КАРТА */}
          <div className="relative h-[450px] md:h-[600px] w-full rounded-[40px] rounded-b-lg overflow-hidden border border-[#bd9b7d]/20 bg-[#f0ede8] max-lg:order-1">
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
                  className="object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#1a1614]/20 group-hover:bg-[#1a1614]/40 transition-colors duration-500 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-[#fdfbf7] text-[#1a1614] rounded-full text-[11px] uppercase tracking-[2px] font-bold shadow-xl"
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
                className="animate-fade-in grayscale-[0.3] contrast-[1.1]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
