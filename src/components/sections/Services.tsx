'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface ServiceItem {
  name: string;
  price: number;
}

const Services = () => {
  const t = useTranslations('Services');
  const maleServices = t.raw('lists.male') as ServiceItem[];
  const femaleServices = t.raw('lists.female') as ServiceItem[];

  return (
    <section
      id="story"
      className="relative bg-brand-paper py-32 md:py-44 overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      <span itemProp="serviceType" className="sr-only">
        {t('meta.serviceType')}
      </span>
      <span itemProp="provider" className="sr-only">
        VelvetSkin
      </span>
      <span itemProp="areaServed" className="sr-only">
        {t('meta.city')}
      </span>

      <div className="relative container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-16 md:mb-28">
          <p className="section-eyebrow">{t('subtitle')}</p>
          <h2 className="section-title">
            {t.rich('title', {
              span: (chunks) => (
                <span className="section-title-accent">{chunks}</span>
              ),
            })}
          </h2>
        </header>

        <div className="relative max-w-[1200px] mx-auto space-y-24 lg:space-y-36">
          <ScrollCard
            title={t('maleTitle')}
            imgSrc="/img/man-price.jpg"
            services={maleServices}
            isFirst={true}
            currency={t('currency')}
            durationHint={t('durationHint')}
          />
          <ScrollCard
            title={t('femaleTitle')}
            imgSrc="/img/woman-price.jpg"
            services={femaleServices}
            isFirst={false}
            currency={t('currency')}
            durationHint={t('durationHint')}
          />
        </div>
      </div>
    </section>
  );
};

const ScrollCard = ({
  title,
  imgSrc,
  services,
  isFirst,
  currency,
  durationHint,
}: {
  title: string;
  imgSrc: string;
  services: ServiceItem[];
  isFirst: boolean;
  currency: string;
  durationHint: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.75, 1],
    reduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4],
    reduceMotion ? [1, 1] : [0.97, 1],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 0.4],
    reduceMotion ? [0, 0] : [60, 0],
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <motion.article
        style={{ opacity, scale, y }}
        className="relative rounded-[28px] md:rounded-[40px] overflow-hidden min-h-[680px] flex items-center justify-center p-4 md:p-12"
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
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,22,20,0.3),rgba(26,22,20,0.78))]" />
        </div>

        <div className="relative z-20 w-full max-w-[900px] flex flex-col items-center mt-auto md:mt-0">
          <h3 className="font-cormorant text-[clamp(2.5rem,5vw,3.75rem)] text-brand-hero-fg mb-3 leading-none font-light tracking-tight">
            {title}
          </h3>
          <p className="font-poppins text-[10px] uppercase tracking-[0.25em] text-brand-champagne/80 mb-8 md:mb-10">
            {durationHint}
          </p>

          <ul className="glass-dark grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-1 w-full rounded-[24px] md:rounded-[28px] p-7 md:p-12">
            {services.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-baseline gap-4 border-b border-white/10 py-4 text-brand-hero-fg group hover:border-brand-champagne/50 transition-colors"
              >
                <span className="font-cormorant text-[17px] md:text-[19px] font-normal group-hover:text-white transition-colors">
                  {item.name}
                </span>
                <span className="font-poppins text-[13px] md:text-[14px] font-medium text-brand-champagne tabular-nums shrink-0">
                  {item.price}{' '}
                  <span className="text-[9px] opacity-70 uppercase tracking-wider">
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
