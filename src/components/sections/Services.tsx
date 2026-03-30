'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

const maleServices = [
  { name: 'Глибоке бікіні повністю', price: 800 },
  { name: 'Бікіні глибоке частково', price: 650 },
  { name: 'Спина повністю', price: 600 },
  { name: 'Груди', price: 400 },
  { name: 'Пахви', price: 200 },
  { name: 'Живіт', price: 400 },
  { name: 'Поперек', price: 200 },
  { name: 'Сідниці', price: 300 },
  { name: 'Корекція бороди', price: 300 },
  { name: 'Ніс/Вуха', price: 100 },
  { name: 'Міжбрівка', price: 50 },
];

const femaleServices = [
  { name: 'Класичне бікіні', price: 350 },
  { name: 'Глибоке бікіні', price: 500 },
  { name: 'Ноги повністю', price: 550 },
  { name: 'Ноги до колін/бедра', price: 350 },
  { name: 'Руки повністю', price: 400 },
  { name: 'Руки до ліктя', price: 250 },
  { name: 'Пахви', price: 150 },
  { name: 'Сідниці', price: 250 },
  { name: 'Поперек', price: 200 },
  { name: 'Живіт', price: 200 },
  { name: 'Ніс', price: 100 },
  { name: 'Корекція брів', price: 100 },
  { name: 'Міжбрівка', price: 50 },
  { name: 'Вусики', price: 150 },
  { name: 'Обличчя повністю', price: 250 },
];

const Services = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section className="min-h-screen bg-[#f6f4f0]" />;

  return (
    <section
      id="story"
      className="relative bg-[#f6f4f0] py-20 overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      <meta
        itemProp="serviceType"
        content="Депіляція воском та шугаринг Запоріжжя"
      />
      <meta itemProp="provider" content="VelvetSkin" />
      <meta itemProp="areaServed" content="Запоріжжя" />

      <div className="relative container mx-auto px-4">
        <header className="text-center mb-16">
          <h2
            className="font-vibes text-[clamp(36px,5vw,56px)] text-[#535353] mb-4"
            itemProp="name"
          >
            Ціни на депіляцію
          </h2>
          <div className="w-24 h-[1px] bg-[#fcb25e] mx-auto" />
        </header>

        <div className="relative max-w-[1100px] mx-auto space-y-20 lg:space-y-40">
          <ScrollCard
            title="Чоловіча депіляція"
            imgSrc="/img/man-price.jpg"
            services={maleServices}
            isFirst={true} // Передаем, что это первая карточка
          />
          <ScrollCard
            title="Жіноча депіляція"
            imgSrc="/img/woman-price.jpg"
            services={femaleServices}
            isFirst={false}
          />
        </div>
      </div>
    </section>
  );
};

const ScrollCard = ({ title, imgSrc, services, isFirst }: any) => {
  // ИСПРАВЛЕНО: Теперь имя переменной совпадает с тем, что в JSX
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center', 'end start'],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0, 1, 1, 0],
  );
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);
  const y = useTransform(scrollYProgress, [0, 0.4], [60, 0]);

  return (
    <div ref={containerRef} className="relative w-full">
      <motion.article
        style={{ opacity, scale, y }}
        className="relative rounded-[50px] overflow-hidden shadow-2xl min-h-[600px] flex items-center justify-center"
        itemProp="hasOfferCatalog"
        itemScope
        itemType="https://schema.org/OfferCatalog"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1100px) 100vw, 1100px"
            priority={isFirst}
            loading={isFirst ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-10" />
        </div>

        <div className="relative z-20 p-6 lg:p-16 w-full flex flex-col items-center">
          <h3
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-3 text-2xl lg:text-3xl font-semibold uppercase tracking-widest text-white mb-8 w-fit"
            itemProp="name"
          >
            {title}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 w-full max-w-[850px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 lg:p-12 shadow-inner">
            {services.map((item: any, idx: number) => (
              <li
                key={idx}
                className="flex justify-between items-baseline border-b border-white/10 pb-2 text-white/90"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <span itemProp="name">{item.name}</span>
                <span className="font-bold text-[#fcb25e]">
                  <span itemProp="price" content={item.price.toString()}>
                    {item.price}
                  </span>{' '}
                  грн.
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
