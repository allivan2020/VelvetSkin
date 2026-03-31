'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ServiceItem {
  name: string;
  price: number;
}

interface ScrollCardProps {
  title: string;
  imgSrc: string;
  services: ServiceItem[];
  isFirst: boolean;
}

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
  return (
    <section
      id="story"
      className="relative bg-[#fdfbf7] py-32 md:py-48 overflow-hidden"
      itemScope
      itemType="https://schema.org/Service"
    >
      <meta
        itemProp="serviceType"
        content="Депіляція воском та шугаринг Запоріжжя"
      />
      <meta itemProp="provider" content="VelvetSkin" />
      <meta itemProp="areaServed" content="Запоріжжя" />

      <div className="relative container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
            Прайс-лист
          </p>
          <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9]">
            Інвестиція у <span className="text-[#917152]">красу</span>
          </h2>
        </header>

        <div className="relative max-w-[1200px] mx-auto space-y-32 lg:space-y-48">
          <ScrollCard
            title="Чоловіча депіляція"
            imgSrc="/img/man-price.jpg"
            services={maleServices}
            isFirst={true}
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

const ScrollCard = ({ title, imgSrc, services, isFirst }: ScrollCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null); // Для TS тоже лучше уточнить тип рефа

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
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ position: 'relative' }}
    >
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
            quality={90}
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,22,20,0.35),rgba(26,22,20,0.85))]" />
        </div>

        <div className="relative z-20 w-full max-w-[900px] flex flex-col items-center mt-auto md:mt-0">
          <h3 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#fdfbf7] mb-8 md:mb-12 leading-none">
            {title}
          </h3>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
            {/* ТУТ ОШИБКА ИСЧЕЗНЕТ: теперь TS знает, что item — это ServiceItem */}
            {services.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-end border-b border-white/10 pb-4 text-[#fdfbf7] group hover:border-[#dcb38a] transition-colors duration-300"
              >
                <span className="text-[15px] md:text-[17px] font-medium tracking-wide group-hover:text-white">
                  {item.name}
                </span>
                <span className="font-poppins text-[15px] md:text-[16px] font-bold text-[#dcb38a]">
                  {item.price}{' '}
                  <span className="text-[10px] opacity-70 uppercase">грн</span>
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
