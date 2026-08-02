'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import QuizModal from '@/components/ui/QuizModal';

interface QuizData {
  experience: string;
  selections: string[];
  name: string;
  contact: string;
  captcha: string;
}

const About = () => {
  const t = useTranslations('About');
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const handleQuizSubmit = async (data: QuizData) => {
    const toastId = toast.loading(t('messages.loading'));

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          contact: data.contact,
          experience: data.experience,
          selections: data.selections,
          type: 'Квіз',
          captcha: data.captcha,
        }),
      });

      if (response.ok) {
        toast.success(t('messages.success'), { id: toastId });
        setIsQuizOpen(false);
      } else {
        toast.error(t('messages.error'), { id: toastId });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t('messages.error'), { id: toastId });
    }
  };

  return (
    <section
      id="about"
      className="relative py-24 md:py-32 bg-brand-paper overflow-hidden"
    >
      <div className="container mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-16 md:gap-24 px-[5%]">
        <figure className="relative flex-1 max-w-[460px] w-full lg:w-auto mb-10 lg:mb-0">
          <div className="w-full aspect-[4/5] relative overflow-hidden rounded-t-[140px] md:rounded-t-[180px] rounded-b-sm">
            <Image
              src="/img/aftor.jpg"
              alt={t('images.mainAlt')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="absolute -bottom-12 left-6 md:-bottom-10 md:-left-4 w-[40%] md:w-[38%] aspect-[3/4] z-[2] -rotate-90 origin-center p-2 md:p-3 bg-brand-paper shadow-[0_24px_48px_rgba(26,22,20,0.12)]">
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

        <article className="flex-[1.2] text-center lg:text-left">
          <header>
            <p className="section-eyebrow">{t('subtitle')}</p>
            <h2 className="section-title mb-10">
              {t.rich('title', {
                br: () => <br />,
                span: (chunks) => (
                  <span className="section-title-accent">{chunks}</span>
                ),
              })}
            </h2>
          </header>

          <div className="border-l border-brand-bronze/35 pl-6 md:pl-10 mb-12">
            <p className="text-[16px] md:text-[17px] leading-[1.85] text-brand-ink/85 font-light mb-6 max-w-[480px] lg:mx-0 mx-auto">
              {t('description1')}
            </p>
            <p className="text-[16px] md:text-[17px] leading-[1.85] text-brand-ink/85 font-light max-w-[480px] lg:mx-0 mx-auto">
              {t.rich('description2', {
                brand: (chunks) => (
                  <span className="font-vibes text-brand-bronze text-[26px] md:text-[28px]">
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </div>

          <ul className="flex gap-12 p-0 mb-14 lg:justify-start justify-center">
            {[1, 2].map((num) => (
              <li key={num} className="flex flex-col gap-2">
                <span className="font-cormorant text-[40px] text-brand-bronze leading-none font-light">
                  0{num}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-muted font-medium">
                  {t(`features.item${num}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => setIsQuizOpen(true)}
              className="btn-primary"
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
