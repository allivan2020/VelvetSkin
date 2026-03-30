'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Contacts = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <section id="contacts" className="py-20 md:py-32 bg-[#fcfaf8]">
      <div className="container mx-auto px-[5%] max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ИНФОРМАЦИЯ */}
          <div className="text-left max-lg:text-center max-lg:order-2">
            <p className="text-[#fcb25e] uppercase tracking-[3px] text-sm mb-4 font-semibold">
              Зв'яжіться з нами
            </p>
            <h2 className="font-vibes text-[clamp(42px,5vw,62px)] text-[#535353] leading-tight mb-10">
              Ваша краса чекає
            </h2>

            <address className="not-italic space-y-8">
              <div className="group">
                <span className="block text-[11px] uppercase text-[#fcb25e] mb-2 tracking-widest font-bold">
                  Адреса:
                </span>
                <p className="text-xl md:text-2xl font-medium text-[#2c2c2c] transition-colors group-hover:text-[#fcb25e]">
                  Запоріжжя, вул. Українська, 43
                </p>
              </div>

              <div className="group">
                <span className="block text-[11px] uppercase text-[#fcb25e] mb-2 tracking-widest font-bold">
                  Телефон:
                </span>
                <a
                  href="tel:+380971950698"
                  className="text-xl md:text-2xl font-medium text-[#2c2c2c] hover:text-[#fcb25e] transition-colors"
                >
                  +38 (097) 195 06 98
                </a>
              </div>

              <div className="group">
                <span className="block text-[11px] uppercase text-[#fcb25e] mb-2 tracking-widest font-bold">
                  Графік:
                </span>
                <p className="text-xl md:text-2xl font-medium text-[#2c2c2c]">
                  Без вихідних
                </p>
              </div>
            </address>

            <div className="mt-12 flex flex-wrap gap-4 max-lg:justify-center">
              <a
                href="https://www.instagram.com/sandy_waxing/"
                target="_blank"
                className="px-8 py-3 border border-[#fcb25e] rounded-full text-[#fcb25e] font-semibold hover:bg-[#fcb25e] hover:text-white transition-all transform hover:-translate-y-1"
              >
                Instagram
              </a>
              <a
                href="https://t.me/sandy_waxing/"
                target="_blank"
                className="px-8 py-3 border border-[#fcb25e] rounded-full text-[#fcb25e] font-semibold hover:bg-[#fcb25e] hover:text-white transition-all transform hover:-translate-y-1"
              >
                Telegram
              </a>
            </div>
          </div>

          {/* КАРТА */}
          <div className="relative h-[400px] md:h-[500px] w-full rounded-[40px] overflow-hidden shadow-2xl bg-[#eee] max-lg:order-1">
            {!showMap ? (
              <div
                className="relative w-full h-full cursor-pointer group"
                onClick={() => setShowMap(true)}
              >
                <Image
                  src="/img/map-placeholder-large.avif" // Твоя заглушка карты (замени на map-placeholder позже)
                  alt="Карта VelvetSkin"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-[#2c2c2c] rounded-full font-bold shadow-xl"
                  >
                    Показати мапу
                  </motion.button>
                </div>
              </div>
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2678.966459345479!2d35.15830937691866!3d47.82079087315581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40dc5f949c258d4d%3A0xe5a3637e96b862!2z0YPQuy4g0KPQutGA0LDQuNC90YHQutCw0Y8sIDQzLCDQl9Cw0L_QvtGA0L7QttGM0LUsINCX0LDQv9C-0YDQvtC20YHQutCw0Y8g0L7QsdC70LDRgdGC0YwsIDY5MDAw!5e0!3m2!1sru!2sua!4v1711200000000!5m2!1sru!2sua"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="animate-fade-in"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
