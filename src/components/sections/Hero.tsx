'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <section
      id="hero"
      className="relative h-[100dvh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#231d19]"
    >
      {/* Постер как основной LCP элемент */}
      <div className="absolute inset-0 bg-black/30">
        <Image
          src="/img/hero-poster.webp" // <-- Смени формат файла на сервере!
          alt="VelvetSkin Smooth Skin Background"
          fill
          className="object-cover opacity-90"
          priority
          quality={70}
          sizes="100vw"
        />
      </div>

      <video
        poster="/img/hero-poster.webp"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        preload="none" // Чтобы видео не «билось» за трафик со шрифтами
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      >
        <source src="/img/hero-video.webm" type="video/webm" />
      </video>

      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(43,35,30,0.6),rgba(20,16,14,0.7))]" />

      <div className="relative z-[3] container mx-auto px-[5%] text-center flex flex-col items-center mt-10">
        <p className="text-[#dcb38a] uppercase tracking-[8px] md:tracking-[12px] text-[10px] md:text-[11px] mb-8 font-light">
          {t('subtitle')}
        </p>
        <h1 className="text-[#fdfbf7] text-[clamp(48px,8vw,105px)] leading-[0.9] mb-8 font-light">
          {t('title')}
          <br />
          <span className="font-vibes text-[#dcb38a] text-[clamp(70px,11vw,130px)] lowercase block mt-4">
            {t('titleAccent')}
          </span>
        </h1>
        <p className="text-[#fdfbf7]/70 text-[15px] md:text-[17px] leading-[1.8] max-w-[480px] font-light">
          {t('description')}
        </p>
      </div>

      {/* Accessibility: Добавлен ролик и лейбл */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-[3] opacity-60"
        aria-label="Scroll down"
        role="presentation"
      >
        <div className="w-[22px] h-[36px] border-[1.5px] border-[#fdfbf7]/60 rounded-full relative after:content-[''] after:absolute after:top-2 after:left-1/2 after:-translate-x-1/2 after:w-[2px] after:h-[6px] after:bg-[#fdfbf7] after:rounded-full after:animate-bounce" />
        <span className="text-[#fdfbf7]/60 text-[9px] uppercase tracking-[0.3em] font-poppins font-light">
          {t('scroll')}
        </span>
      </div>
    </section>
  );
};

export default Hero;
