'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const Hero = () => {
  const t = useTranslations('Hero');

  return (
    <section
      id="hero"
      className="relative h-[100dvh] min-h-[700px] flex items-center justify-center overflow-hidden bg-brand-hero"
    >
      <div className="absolute inset-0 bg-black/25">
        <Image
          src="/img/hero-poster.webp"
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
        preload="none"
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      >
        <source src="/img/hero-video.webm" type="video/webm" />
      </video>

      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(35,28,24,0.45),rgba(20,16,14,0.72))]" />

      <div className="relative z-[3] container mx-auto px-[5%] text-center flex flex-col items-center mt-10">
        <p className="text-brand-champagne uppercase tracking-[0.4em] md:tracking-[0.55em] text-[10px] md:text-[11px] mb-8 font-light">
          {t('subtitle')}
        </p>
        <h1 className="font-cormorant text-brand-hero-fg text-[clamp(48px,8vw,100px)] leading-[0.92] mb-6 font-light tracking-tight">
          {t('title')}
          <br />
          <span className="font-vibes text-brand-champagne text-[clamp(64px,10vw,120px)] lowercase block mt-3 tracking-normal">
            {t('titleAccent')}
          </span>
        </h1>
        <p className="text-brand-hero-fg/65 text-[15px] md:text-[16px] leading-[1.85] max-w-[420px] font-light">
          {t('description')}
        </p>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-[3] opacity-50"
        aria-label="Scroll down"
        role="presentation"
      >
        <div className="w-[20px] h-[32px] border border-brand-hero-fg/50 rounded-full relative after:content-[''] after:absolute after:top-2 after:left-1/2 after:-translate-x-1/2 after:w-[1.5px] after:h-[5px] after:bg-brand-hero-fg after:rounded-full after:animate-bounce" />
        <span className="text-brand-hero-fg/55 text-[9px] uppercase tracking-[0.35em] font-poppins font-light">
          {t('scroll')}
        </span>
      </div>
    </section>
  );
};

export default Hero;
