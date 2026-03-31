'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const reviews = [
  {
    id: 1,
    name: 'Катерина',
    text: 'Дуже сподобалось! Робила глибоке бікіні перший раз, дуже боялася, але майстер все зробила максимально комфортно та швидко. Шкіра ідеально гладка. Дякую VelvetSkin!',
    date: '12 Березня 2026',
    source: 'Instagram',
    link: 'https://instagram.com/sandy_waxing', // Тут лінк на пост або скрін
  },
  {
    id: 2,
    name: 'Аліна',
    text: 'Найкраща студія в Запоріжжі! Атмосфера просто супер, кабінет дуже чистий, матеріали преміум. Результат тримається довше, ніж після шугарингу. Тепер тільки до вас.',
    date: '05 Березня 2026',
    source: 'Telegram',
    link: '#',
  },
  {
    id: 3,
    name: 'Марина',
    text: 'Я ваш постійний клієнт вже півроку. Завжди ідеальний сервіс, приємні ціни і жодного врослого волосся. Окреме дякую за смачну каву після процедури!',
    date: '28 Лютого 2026',
    source: 'Google',
    link: '#',
  },
];

const Reviews = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextReview = () =>
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () =>
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section
      id="reviews"
      className="relative py-32 md:py-48 overflow-hidden bg-[#fdfbf7]"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#bd9b7d]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#bd9b7d] mb-6 font-medium">
            Відгуки
          </p>
          <h2 className="font-vibes text-[clamp(42px,6vw,64px)] text-[#231d19] leading-[1.05] font-light">
            Ваші <span className="italic text-[#bd9b7d]">історії</span>{' '}
            гладкості
          </h2>
        </header>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.article
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center flex flex-col items-center"
            >
              <span className="font-cormorant italic text-[80px] md:text-[120px] text-[#bd9b7d]/20 leading-none block mb-[-20px] md:mb-[-40px]">
                &ldquo;
              </span>

              <p className="font-cormorant italic text-[22px] md:text-[32px] leading-[1.6] text-[#4a3f39] mb-8 px-4">
                {reviews[activeIndex].text}
              </p>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-poppins text-[12px] uppercase tracking-[3px] text-[#231d19] font-semibold">
                    {reviews[activeIndex].name}
                  </h3>
                  {/* Кнопка-доказ */}
                  <Link
                    href={reviews[activeIndex].link}
                    target="_blank"
                    className="text-[9px] uppercase tracking-[2px] text-[#bd9b7d] border border-[#bd9b7d]/30 px-3 py-1 rounded-full hover:bg-[#bd9b7d] hover:text-white transition-all duration-500"
                  >
                    Оригінал ({reviews[activeIndex].source})
                  </Link>
                </div>
                <span className="text-[#bd9b7d]/60 text-[11px] font-light tracking-[1px]">
                  {reviews[activeIndex].date}
                </span>
              </div>
            </motion.article>
          </AnimatePresence>

          {/* НАВІГАЦІЯ */}
          <div className="flex justify-center items-center gap-16 mt-16 md:mt-24">
            <button
              onClick={prevReview}
              aria-label="Попередній відгук"
              className="group flex items-center gap-4 text-[#bd9b7d]"
            >
              <div className="w-12 h-[1px] bg-[#bd9b7d]/30 group-hover:w-16 group-hover:bg-[#bd9b7d] transition-all duration-500" />
              <span className="text-[10px] uppercase tracking-[3px] font-medium hidden md:block">
                Prev
              </span>
            </button>

            <div className="flex gap-3">
              {reviews.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-[#bd9b7d] scale-125' : 'bg-[#bd9b7d]/20'}`}
                />
              ))}
            </div>

            <button
              onClick={nextReview}
              aria-label="Наступний відгук"
              className="group flex items-center gap-4 text-[#bd9b7d]"
            >
              <span className="text-[10px] uppercase tracking-[3px] font-medium hidden md:block">
                Next
              </span>
              <div className="w-12 h-[1px] bg-[#bd9b7d]/30 group-hover:w-16 group-hover:bg-[#bd9b7d] transition-all duration-500" />
            </button>
          </div>
        </div>

        {/* КНОПКА ЗАЛИШИТИ ВІДГУК: Стримано та елегантно */}
        <div className="mt-24 md:mt-32 text-center">
          <Link
            href="https://t.me/sandy_waxing"
            target="_blank"
            className="font-poppins text-[10px] uppercase tracking-[3px] text-[#4a3f39]/50 hover:text-[#bd9b7d] transition-colors duration-500 flex flex-col items-center gap-4"
          >
            <div className="w-[1px] h-12 bg-[#bd9b7d]/30" />
            Поділитися своїм досвідом
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
