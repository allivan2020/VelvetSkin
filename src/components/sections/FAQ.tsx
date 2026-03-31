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
      className="relative py-32 md:py-48 px-4 overflow-hidden bg-[#fdfbf7]"
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="relative z-10 max-w-[800px] mx-auto">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
            Відповіді на питання
          </p>
          <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9]">
            Часті <span className="text-[#917152]">запитання</span>
          </h2>
        </header>

        {/* Акордеон без важких контейнерів - тільки витончені лінії */}
        <div className="space-y-2">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="border-b border-[#bd9b7d]/20 transition-all duration-500"
              itemProp="mainEntity"
              itemScope
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center py-8 md:py-10 text-left focus:outline-none group"
              >
                <span className="text-[18px] md:text-[22px] font-cormorant text-[#1a1614] font-medium tracking-wide transition-colors group-hover:text-[#917152]">
                  {item.q}
                </span>
                <div
                  className={`flex-shrink-0 w-5 h-5 text-[#bd9b7d] transition-transform duration-500 ease-out ${
                    openIndex === index ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-full h-full"
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                    itemProp="acceptedAnswer"
                    itemScope
                    itemType="https://schema.org/Answer"
                  >
                    <div
                      className="pb-10 text-[15px] md:text-[16px] text-[#4a3f39]/70 leading-[1.8] font-light max-w-[90%]"
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
