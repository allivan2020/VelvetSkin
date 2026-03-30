'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <section className="h-[100dvh] bg-black" />;

  return (
    <section
      id="hero"
      className="relative h-[100dvh] min-h-[700px] flex items-center overflow-hidden bg-black"
    >
      {/* 1. ПОСТЕР (Оптимизированный) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/hero-poster.jpg"
          alt="VelvetSkin Background"
          fill
          className="object-cover"
          priority
          quality={75} // Исправлено на стандартное значение
        />
      </div>

      {/* 2. ВИДЕО (Поверх постера) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-1000"
        onCanPlay={(e) => (e.currentTarget.style.opacity = '1')}
        style={{ opacity: 0 }}
      >
        <source src="/img/hero-video.mp4" type="video/mp4" />
      </video>

      {/* 3. ГРАДИЕНТ (Затемнение) */}
      <div className="absolute inset-0 z-[2] bg-black/40 bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_0%,transparent_100%)]" />

      {/* 4. КОНТЕНТ (Твой текст вернулся на место) */}
      <div className="relative z-[3] container mx-auto px-[5%] text-left max-md:text-center">
        <article className="flex flex-col items-start max-md:items-center max-w-[650px] max-md:max-w-full">
          <p className="text-[#fcb25e] uppercase tracking-[5px] text-[13px] mb-5 font-semibold animate-fade-in-up">
            Студія воскової депіляції VelvetSkin
          </p>

          <h1 className="text-white text-[clamp(42px,7vw,92px)] leading-[1.05] mb-6 font-normal animate-fade-in-up [animation-delay:200ms]">
            Воскова депіляція
            <br />
            <span className="font-vibes text-[#fcb25e] capitalize">
              чисте мистецтво
            </span>
          </h1>

          <p className="text-white/85 text-[18px] leading-[1.6] max-w-[500px] font-light animate-fade-in-up [animation-delay:400ms]">
            Відчуй ідеальну гладкість та преміальний догляд за шкірою у
            Запоріжжі. Ми перетворили депіляцію на ритуал краси.
          </p>
        </article>
      </div>

      {/* 5. СКРОЛЛ ИНДИКАТОР */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[3] opacity-70 animate-bounce">
        <div className="w-[20px] h-[35px] border-2 border-white rounded-full relative after:content-[''] after:absolute after:top-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-2 after:bg-white after:rounded-full" />
        <span className="text-white text-[10px] uppercase tracking-widest font-poppins">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default Hero;
