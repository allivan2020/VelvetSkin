'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Contacts = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <section
      id="contacts"
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      {/* М'який світловий акцент — зробив трохи видимішим для глибини */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#bd9b7d]/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-[5%] max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* ІНФОРМАЦІЯ */}
          <div className="text-left max-lg:text-center max-lg:order-2">
            <p className="text-[#917152] uppercase tracking-[6px] text-[10px] md:text-[11px] mb-6 font-semibold">
              Зв{"'"}яжіться з нами
            </p>

            {/* Рукописний заголовок з посиленим кольором */}
            <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9] mb-12">
              Ваша <span className="text-[#917152]">краса</span>{' '}
              <br className="hidden md:block" /> починається тут
            </h2>

            <address className="not-italic space-y-12">
              <div className="group">
                <span className="block text-[10px] uppercase text-[#917152] mb-3 tracking-[3px] font-bold">
                  Локація
                </span>
                <p className="font-cormorant text-2xl md:text-3xl text-[#1a1614] font-medium">
                  Запоріжжя, вул. Українська, 43
                </p>
              </div>

              <div className="group">
                <span className="block text-[10px] uppercase text-[#917152] mb-3 tracking-[3px] font-bold">
                  Телефон
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
                  Години візитів
                </span>
                <p className="font-cormorant text-2xl md:text-3xl text-[#1a1614] font-medium">
                  Працюємо без вихідних
                </p>
              </div>
            </address>

            {/* Соціальні мережі — зробив кнопки темнішими для контрасту */}
            <div className="mt-16 flex flex-wrap gap-6 max-lg:justify-center">
              <a
                href="https://www.instagram.com/sandy_waxing/"
                aria-label="Наш Instagram"
                rel="noopener noreferrer"
                suppressHydrationWarning={true}
                target="_blank"
                className="px-10 py-3.5 border border-[#1a1614]/20 rounded-full text-[#1a1614] text-[10px] uppercase tracking-[2px] font-bold hover:bg-[#1a1614] hover:text-[#fdfbf7] transition-all duration-500"
              >
                Instagram
              </a>
              <a
                href="https://t.me/sandy_waxing/"
                aria-label="Наш Telegram"
                rel="noopener noreferrer"
                suppressHydrationWarning={true}
                target="_blank"
                className="px-10 py-3.5 border border-[#1a1614]/20 rounded-full text-[#1a1614] text-[10px] uppercase tracking-[2px] font-bold hover:bg-[#1a1614] hover:text-[#fdfbf7] transition-all duration-500"
              >
                Telegram
              </a>
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
                  alt="Локація VelvetSkin на карті Запоріжжя"
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
                    Переглянути на мапі
                  </motion.button>
                </div>
              </div>
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2704.645693898742!2d35.15837834751748!3d47.827017671500755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40dc60aab8b82aab%3A0x2095f293e4eef4c6!2z0LLRg9C7LiDQo9C60YDQsNGX0L3RgdGM0LrQsCwgNDMsINCX0LDQv9C-0YDRltC20LbRjywg0JfQsNC_0L7RgNGW0LfRjNC60LAg0L7QsdC70LDRgdGC0YwsIDY5MDAw!5e1!3m2!1suk!2sua!4v1774939984064!5m2!1suk!2sua"
                width="100%"
                height="100%"
                title="Карта проїзду до студії VelvetSkin"
                style={{ border: 0 }}
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
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
