'use client';

import Link from 'next/link';
import Image from 'next/image';

const About = () => {
  return (
    <section
      id="about"
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      <div className="container mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-16 md:gap-24 px-[5%]">
        {/* БЛОК З КАРТИНКАМИ */}
        <figure className="relative flex-1 max-w-[460px] w-full lg:w-auto mb-10 lg:mb-0">
          <div className="w-full aspect-[4/5] relative overflow-hidden rounded-t-[150px] md:rounded-t-[200px] rounded-b-md">
            <Image
              src="/img/aftor.jpg"
              alt="Майстер депіляції"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="absolute -bottom-15 left-6 md:-bottom-12 md:-left-4 w-[40%] md:w-[38%] aspect-[3/4] z-[2] -rotate-90 origin-center p-2 md:p-3 bg-[#fdfbf7] shadow-[0_20px_40px_rgba(74,63,57,0.15)]">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/img/sert.jpg"
                alt="Сертифікат"
                quality={75}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>
          </div>
        </figure>

        {/* БЛОК З ТЕКСТОМ */}
        <article className="flex-[1.2] text-left lg:text-left text-center">
          <header>
            <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
              Естетична косметологія
            </p>
            <h2 className="font-vibes text-[clamp(54px,7vw,82px)] text-[#1a1614] leading-[0.9] mb-10">
              Професійний догляд <br /> за{' '}
              <span className="text-[#917152]">вашою</span> шкірою
            </h2>
          </header>

          <div className="border-l-2 border-[#917152]/30 pl-6 md:pl-10 mb-12">
            <p className="text-[16px] md:text-[18px] leading-[1.8] text-[#1a1614] font-light mb-6 max-w-[480px] lg:mx-0 mx-auto">
              Ми віримо, що краса — це не лише зовнішній вигляд, а й внутрішнє
              відчуття впевненості.
            </p>
            <p className="text-[16px] md:text-[18px] leading-[1.8] text-[#1a1614] font-light max-w-[480px] lg:mx-0 mx-auto">
              Velvet{' '}
              <span className="font-vibes text-[#917152] text-[28px]">
                Skin
              </span>{' '}
              — коли турбота про себе стає мистецтвом.
            </p>
          </div>

          <ul className="flex gap-12 p-0 mb-14 lg:justify-start justify-center">
            <li className="flex flex-col gap-2">
              <span className="font-vibes text-[42px] text-[#917152] leading-none">
                01
              </span>
              <span className="text-[10px] uppercase tracking-[2px] text-[#1a1614] font-bold">
                Сертифіковані майстри
              </span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="font-vibes text-[42px] text-[#917152] leading-none">
                02
              </span>
              <span className="text-[10px] uppercase tracking-[2px] text-[#1a1614] font-bold">
                Преміальна косметика
              </span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
};

export default About;
