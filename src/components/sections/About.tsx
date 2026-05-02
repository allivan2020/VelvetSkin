'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import QuizModal from '@/components/ui/QuizModal';

interface QuizData {
  experience: string;
  selections: string[];
  name: string;
  contact: string;
}

const About = () => {
  const t = useTranslations('About');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleQuizSubmit = async (data: QuizData) => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'Квіз', // Можно оставить статичным или тоже брать из t.raw
          status: 'Новий',
        }),
      });

      if (response.ok) {
        alert(t('messages.success'));
        setIsQuizOpen(false);
      } else {
        alert(t('messages.error'));
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <section
      id="about"
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      <div className="container mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-16 md:gap-24 px-[5%]">
        {/* БЛОК С ИЗОБРАЖЕНИЯМИ */}
        <figure className="relative flex-1 max-w-[460px] w-full lg:w-auto mb-10 lg:mb-0">
          <div className="w-full aspect-[4/5] relative overflow-hidden rounded-t-[150px] md:rounded-t-[200px] rounded-b-md">
            <Image
              src="/img/aftor.jpg"
              alt={t('images.mainAlt')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="absolute -bottom-15 left-6 md:-bottom-12 md:-left-4 w-[40%] md:w-[38%] aspect-[3/4] z-[2] -rotate-90 origin-center p-2 md:p-3 bg-[#fdfbf7] shadow-[0_20px_40px_rgba(74,63,57,0.15)]">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/img/sert.webp"
                alt={t('images.certAlt')}
                quality={75}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          </div>
        </figure>

        {/* БЛОК С ТЕКСТОМ */}
        <article className="flex-[1.2] text-center lg:text-left">
          <header>
            <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
              {t('subtitle')}
            </p>
            <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9] mb-10">
              {t.rich('title', {
                br: () => <br />,
                span: (chunks) => (
                  <span className="text-[#917152]">{chunks}</span>
                ),
              })}
            </h2>
          </header>

          <div className="border-l-2 border-[#917152]/30 pl-6 md:pl-10 mb-12">
            <p className="text-[16px] md:text-[18px] leading-[1.8] text-[#1a1614] font-light mb-6 max-w-[480px] lg:mx-0 mx-auto">
              {t('description1')}
            </p>
            <p className="text-[16px] md:text-[18px] leading-[1.8] text-[#1a1614] font-light max-w-[480px] lg:mx-0 mx-auto">
              {t.rich('description2', {
                brand: (chunks) => (
                  <span className="font-vibes text-[#917152] text-[28px]">
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </div>

          <ul className="flex gap-12 p-0 mb-14 lg:justify-start justify-center">
            {[1, 2].map((num) => (
              <li key={num} className="flex flex-col gap-2">
                <span className="font-vibes text-[42px] text-[#917152] leading-none">
                  0{num}
                </span>
                <span className="text-[10px] uppercase tracking-[2px] text-[#1a1614] font-bold">
                  {t(`features.item${num}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center lg:justify-start">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="px-8 py-4 bg-[#bd9b7d] text-white rounded-full font-poppins text-[12px] md:text-[13px] uppercase tracking-[2px] transition-all hover:bg-[#a6856a] shadow-lg active:scale-95"
            >
              {t('ctaButton')}
            </button>
          </div>
        </article>
      </div>

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSubmit={handleQuizSubmit}
      />
    </section>
  );
};

export default About;
