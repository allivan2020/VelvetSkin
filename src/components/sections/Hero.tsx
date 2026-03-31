'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

const Hero = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Теплый темный фон вместо холодного черного
  if (!mounted) return <section className="h-[100dvh] bg-[#231d19]" />;

  return (
    <section
      id="hero"
      className="relative h-[100dvh] min-h-[700px] flex items-center justify-center overflow-hidden bg-[#231d19]"
    >
      {/* 1. ПОСТЕР */}
      <div className="absolute inset-0 bg-black/30">
        <Image
          src="/img/hero-poster.jpg"
          alt="VelvetSkin Background"
          fill
          className="object-cover opacity-90"
          priority
          loading="eager"
          quality={75}
        />
      </div>

      {/* 2. ВИДЕО */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-[1] transition-opacity duration-1000"
        onCanPlay={(e) => (e.currentTarget.style.opacity = '1')}
        style={{ opacity: 0 }}
      >
        <source src="/img/hero-video.webm" type="video/webm" />
      </video>

      {/* 3. ГРАДИЕНТ (Тепле бронзове затемнення замість сірого) */}
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(43,35,30,0.6),rgba(20,16,14,0.7))]" />

      {/* 4. КОНТЕНТ */}
      <div className="relative z-[3] container mx-auto px-[5%] text-center flex flex-col items-center mt-10">
        <p className="text-[#dcb38a] uppercase tracking-[8px] md:tracking-[12px] text-[10px] md:text-[11px] mb-8 font-light animate-fade-in-up">
          Студія воскової депіляції
        </p>

        {/* Текст тепер не чисто білий, а кремовий (#fdfbf7) */}
        <h1 className="text-[#fdfbf7] text-[clamp(46px,8vw,100px)] leading-[1] mb-8 font-light animate-fade-in-up [animation-delay:200ms]">
          Воскова депіляція
          <br />
          <span className="font-cormorant italic text-[#dcb38a] font-light lowercase text-[clamp(54px,9vw,110px)] tracking-tight">
            чисте мистецтво
          </span>
        </h1>

        <p className="text-[#fdfbf7]/70 text-[15px] md:text-[17px] leading-[1.8] max-w-[480px] font-light animate-fade-in-up [animation-delay:400ms]">
          Відчуй ідеальну гладкість та преміальний догляд за шкірою. Ми
          перетворили депіляцію на ритуал краси.
        </p>
      </div>

      {/* 5. СКРОЛЛ ИНДИКАТОР */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-[3] opacity-60 hover:opacity-100 transition-opacity duration-500">
        <div className="w-[22px] h-[36px] border-[1.5px] border-[#fdfbf7]/60 rounded-full relative after:content-[''] after:absolute after:top-2 after:left-1/2 after:-translate-x-1/2 after:w-[2px] after:h-[6px] after:bg-[#fdfbf7] after:rounded-full after:animate-bounce" />
        <span className="text-[#fdfbf7]/60 text-[9px] uppercase tracking-[0.3em] font-poppins font-light">
          Scroll
        </span>
      </div>
    </section>
  );
};

export default Hero;
