'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

interface FAQItem {
  q: string;
  a: string;
}

const FAQ = () => {
  const t = useTranslations('FAQ');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Получаем массив вопросов из JSON. Если данных нет — используем пустой массив.
  const faqItems = (t.raw('items') as FAQItem[]) || [];

  // Генерируем данные для Google на лету для текущего языка
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="relative py-32 md:py-48 px-4 overflow-hidden bg-[#fdfbf7]"
    >
      {/* SEO-разметка, которая меняется вместе с языком сайта */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative z-10 max-w-[800px] mx-auto">
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

        <div className="space-y-2">
          {Array.isArray(faqItems) &&
            faqItems.map((item, index) => (
              <div
                key={index}
                className="border-b border-[#bd9b7d]/20 transition-all duration-500"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
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
                    >
                      <div className="pb-10 text-[15px] md:text-[16px] text-[#4a3f39]/70 leading-[1.8] font-light max-w-[90%]">
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
