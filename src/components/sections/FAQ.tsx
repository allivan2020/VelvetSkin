'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    q: 'Якої довжини має бути волосся?',
    a: 'Для першої процедури оптимальна довжина — 5–7 мм (це приблизно 2 тижні після бритви). Для наступних візитів достатньо 3–5 мм.',
  },
  {
    q: 'Це дуже боляче?',
    a: 'Відчуття індивідуальні, але ми робимо все, щоб мінімізувати дискомфорт: використовуємо професійні техніки та преміальні матеріали. З кожним разом процедура проходить легше.',
  },
  {
    q: 'Чи буває подразнення після процедури?',
    a: 'Легке почервоніння — це нормальна реакція, яка проходить протягом кількох годин. Наприкінці сеансу ми наносимо заспокійливий засіб та даємо рекомендації щодо домашнього догляду.',
  },
  {
    q: 'Як часто потрібно робити депіляцію?',
    a: 'Зазвичай процедуру рекомендують повторювати кожні 3–4 тижні. За цей час волоски встигають відрости до оптимальної довжини для ефективного видалення.',
  },
  {
    q: 'На скільки вистачає результату?',
    a: 'Після депіляції шкіра залишається гладенькою в середньому 2–4 тижні, залежно від зони, типу волосся та індивідуальних особливостей росту.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative py-24 px-4 overflow-hidden bg-[#fcfaf8]"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      {/* Визуальные блобы (Background Blobs) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[10%] -right-[5%] w-[300px] h-[300px] rounded-full bg-radial-gradient from-[#e1ccb9] to-transparent blur-[80px] opacity-60 hidden md:block" />
        <div className="absolute bottom-0 -left-[10%] w-[400px] h-[400px] rounded-full bg-radial-gradient from-[#eaddcf] to-transparent blur-[80px] opacity-60 hidden md:block" />
      </div>

      <div className="relative z-10 max-w-[600px] mx-auto">
        <header className="text-center mb-12">
          <h2 className="font-vibes text-[clamp(42px,6vw,64px)] text-[#535353] leading-tight">
            Часті питання
          </h2>
          <div className="w-20 h-[1px] bg-[#fcb25e] mx-auto mt-4" />
        </header>

        {/* Стеклянный контейнер аккордеона */}
        <div className="bg-white/35 backdrop-blur-[20px] border border-white/60 rounded-[32px] shadow-xl overflow-hidden">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-b border-white/60 last:border-none transition-colors hover:bg-white/10"
              itemProp="mainEntity"
              itemScope
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-6 md:p-8 text-left focus:outline-none group"
              >
                <span
                  className="text-lg md:text-xl font-medium text-[#2c2c2c]/90"
                  itemProp="name"
                >
                  {item.q}
                </span>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.4, ease: 'circOut' }}
                  className="w-6 h-6 text-[#fcb25e] flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 4V20M4 12H20"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                    itemProp="acceptedAnswer"
                    itemScope
                    itemType="https://schema.org/Answer"
                  >
                    <div
                      className="px-6 md:px-8 pb-8 text-[#2c2c2c]/70 leading-relaxed"
                      itemProp="text"
                    >
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
