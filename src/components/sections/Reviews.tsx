'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const reviews = [
  {
    id: 1,
    name: 'Катерина',
    stars: 5,
    text: 'Дуже сподобалось! Робила глибоке бікіні перший раз, дуже боялася, але майстер все зробила максимально комфортно та швидко. Шкіра ідеально гладка. Дякую VelvetSkin!',
    date: '12 Березня 2026',
    proof: '/img/man-price.jpg', // Заглушка
  },
  {
    id: 2,
    name: 'Аліна (Instagram)',
    stars: 5,
    text: 'Найкраща студія в Запоріжжі! Атмосфера просто супер, кабінет дуже чистий, матеріали преміум. Результат тримається довше, ніж після шугарингу. Тепер тільки до вас 🤎',
    date: '05 Березня 2026',
    proof: '/img/man-price.jpg',
  },
  {
    id: 3,
    name: 'Марина',
    stars: 5,
    text: 'Я ваш постійний клієнт вже півроку. Завжди ідеальний сервіс, приємні ціни і жодного врослого волосся. Окреме дякую за смачну каву після процедури!',
    date: '28 Лютого 2026',
    proof: '/img/man-price.jpg',
  },
];

const Reviews = () => {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const nextReview = () =>
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () =>
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  if (!mounted) return null;

  return (
    <section
      id="reviews"
      className="relative py-24 overflow-hidden min-h-[700px] flex items-center"
    >
      {/* ФОН С РАЗМЫТИЕМ (Как в оригинале) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/hero-poster.jpg" // Твой фоновый вейб
          alt="Background"
          fill
          className="object-cover blur-xl scale-110 opacity-40"
        />
        <div className="absolute inset-0 bg-[#b3b0b0]/30 mix-blend-overlay" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <header className="text-center mb-16">
          <p className="text-[#fcb25e] uppercase tracking-[3px] text-sm mb-2 font-semibold">
            Довіра та любов
          </p>
          <h2 className="font-vibes text-[clamp(42px,6vw,72px)] text-[#535353] leading-tight">
            Відгуки наших клієнтів
          </h2>
          <div className="w-20 h-[1px] bg-[#fcb25e] mx-auto mt-4" />
        </header>

        {/* КАРУСЕЛЬ */}
        <div className="relative flex flex-col items-center">
          <div className="flex gap-6 items-center justify-center w-full max-w-4xl min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.article
                key={activeIndex}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ duration: 0.5, ease: 'circOut' }}
                className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] p-8 md:p-12 shadow-2xl max-w-2xl w-full"
              >
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {reviews[activeIndex].name}
                    </h3>
                    <div className="text-[#fcb25e] tracking-widest text-sm">
                      ⭐⭐⭐⭐⭐
                    </div>
                  </div>

                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2 text-white text-xs transition-all backdrop-blur-md">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 5h14v14H5V5zm4 12h10l-3-4-2 3-2-3-3 4z" />
                    </svg>
                    Оригінал
                  </button>
                </div>

                <p className="text-white/90 text-lg md:text-xl italic leading-relaxed mb-8">
                  &ldquo;{reviews[activeIndex].text}&rdquo;
                </p>

                <div className="text-white/50 text-sm font-light tracking-wide">
                  {reviews[activeIndex].date}
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* НАВИГАЦИЯ */}
          <div className="flex gap-6 mt-12">
            <button
              onClick={prevReview}
              className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#fcb25e] hover:border-[#fcb25e] transition-all"
            >
              ❮
            </button>
            <button
              onClick={nextReview}
              className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#fcb25e] hover:border-[#fcb25e] transition-all"
            >
              ❯
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
