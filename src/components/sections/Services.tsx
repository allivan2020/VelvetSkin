'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ServiceItem {
  name: string;
  price: number;
}

const Services = () => {
  const t = useTranslations('Services');

  // Получаем массивы услуг из JSON
  const maleServices = t.raw('lists.male') as ServiceItem[];
  const femaleServices = t.raw('lists.female') as ServiceItem[];

  return (
    <section
      id="story"
      className="relative bg-[#fdfbf7] py-32 md:py-48 overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      {/* Локализованные мета-теги для SEO */}
      <meta itemProp="serviceType" content={t('meta.serviceType')} />
      <meta itemProp="provider" content="VelvetSkin" />
      <meta itemProp="areaServed" content={t('meta.city')} />

      <div className="relative container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
            {t('subtitle')}
          </p>
          <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9]">
            {t.rich('title', {
              span: (chunks) => (
                <span className="text-[#917152]">{chunks}</span>
              ),
            })}
          </h2>
        </header>

        <div className="relative max-w-[1200px] mx-auto space-y-32 lg:space-y-48">
          <ScrollCard
            title={t('maleTitle')}
            imgSrc="/img/man-price.jpg"
            services={maleServices}
            isFirst={true}
            currency={t('currency')}
          />
          <ScrollCard
            title={t('femaleTitle')}
            imgSrc="/img/woman-price.jpg"
            services={femaleServices}
            isFirst={false}
            currency={t('currency')}
          />
        </div>
      </div>
    </section>
  );
};

// Вспомогательный компонент карточки
const ScrollCard = ({
  title,
  imgSrc,
  services,
  isFirst,
  currency,
}: {
  title: string;
  imgSrc: string;
  services: ServiceItem[];
  isFirst: boolean;
  currency: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.75, 1],
    [0, 1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [100, 0]);

  return (
    <div ref={containerRef} className="relative w-full">
      <motion.article
        style={{ opacity, scale, y }}
        className="relative rounded-[40px] md:rounded-[60px] overflow-hidden min-h-[700px] flex items-center justify-center p-4 md:p-12 shadow-2xl"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority={isFirst}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,22,20,0.35),rgba(26,22,20,0.85))]" />
        </div>

        <div className="relative z-20 w-full max-w-[900px] flex flex-col items-center mt-auto md:mt-0">
          <h3 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#fdfbf7] mb-8 md:mb-12 leading-none">
            {title}
          </h3>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-14">
            {services.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-end border-b border-white/10 pb-4 text-[#fdfbf7] group hover:border-[#dcb38a] transition-colors"
              >
                <span className="text-[15px] md:text-[17px] font-medium group-hover:text-white">
                  {item.name}
                </span>
                <span className="font-poppins text-[15px] md:text-[16px] font-bold text-[#dcb38a]">
                  {item.price}{' '}
                  <span className="text-[10px] opacity-70 uppercase">
                    {currency}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </motion.article>
    </div>
  );
};

export default Services;
