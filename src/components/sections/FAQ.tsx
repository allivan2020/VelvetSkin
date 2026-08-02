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
  const faqItems = (t.raw('items') as FAQItem[]) || [];

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
      className="relative py-20 md:py-28 px-4 overflow-hidden bg-brand-paper"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative z-10 max-w-[760px] mx-auto">
        <header className="text-center mb-12 md:mb-16">
          <h2 className="section-title">
            {t.rich('title', {
              span: (chunks) => (
                <span className="section-title-accent">{chunks}</span>
              ),
            })}
          </h2>
        </header>

        <div>
          {Array.isArray(faqItems) &&
            faqItems.map((item, index) => (
              <div
                key={index}
                className="border-b border-brand-line transition-colors duration-500"
              >
                <button
                  type="button"
                  aria-expanded={openIndex === index}
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex justify-between items-center gap-6 py-7 md:py-8 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-bronze group"
                >
                  <span className="text-[18px] md:text-[22px] font-cormorant text-brand-ink font-normal tracking-wide transition-colors group-hover:text-brand-bronze">
                    {item.q}
                  </span>
                  <div
                    className={`flex-shrink-0 w-4 h-4 text-brand-bronze/70 transition-transform duration-500 ease-out ${
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
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 text-[15px] md:text-[16px] text-brand-muted leading-[1.85] font-light max-w-[92%]">
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
