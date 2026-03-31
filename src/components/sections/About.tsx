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

          <div className="absolute -bottom-8 -left-6 md:-left-12 w-[55%] aspect-[3/4] z-[2] p-2 md:p-3 bg-[#fdfbf7] shadow-[0_20px_40px_rgba(74,63,57,0.08)]">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src="/img/sert.jpg"
                alt="Сертифікат"
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
            <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[4px] md:tracking-[6px] text-[#bd9b7d] mb-6 font-medium">
              Естетична косметологія
            </p>
            <h2 className="font-cormorant text-[clamp(42px,6vw,64px)] text-[#231d19] leading-[1.05] mb-10 font-light">
              Професійний догляд <br /> за вашою шкірою
            </h2>
          </header>

          <div className="border-l border-[#bd9b7d]/30 pl-6 md:pl-10 mb-12">
            <p className="text-[16px] md:text-[18px] leading-[1.9] text-[#4a3f39]/80 font-light mb-6 max-w-[480px] lg:mx-0 mx-auto">
              Ми віримо, що краса — це не лише зовнішній вигляд, а й внутрішнє
              відчуття впевненості.
            </p>
            <p className="text-[16px] md:text-[18px] leading-[1.9] text-[#4a3f39]/80 font-light mb-6 max-w-[480px] lg:mx-0 mx-auto">
              Кожна процедура депіляції у нашій студії в Олександрівському
              районі Запоріжжя — це ритуал турботи про себе, виконаний з
              бездоганним професіоналізмом.
            </p>
            <p className="text-[16px] md:text-[18px] leading-[1.9] text-[#4a3f39]/80 font-light max-w-[480px] lg:mx-0 mx-auto">
              Velvet
              <span className="font-cormorant italic text-[#917152] text-[22px]">
                Skin
              </span>{' '}
              — коли турбота про себе стає красивим мистецтвом.
            </p>
          </div>

          <ul className="flex gap-12 p-0 mb-14 lg:justify-start justify-center">
            <li className="flex flex-col gap-2">
              <span className="font-cormorant italic text-[36px] text-[#bd9b7d]/60 leading-none">
                01
              </span>
              <span className="text-[10px] uppercase tracking-[2px] text-[#231d19] font-medium">
                Сертифіковані майстри
              </span>
            </li>
            <li className="flex flex-col gap-2">
              <span className="font-cormorant italic text-[36px] text-[#bd9b7d]/60 leading-none">
                02
              </span>
              <span className="text-[10px] uppercase tracking-[2px] text-[#231d19] font-medium">
                Преміальна косметика
              </span>
            </li>
          </ul>

          <div className="lg:flex lg:justify-start flex justify-center">
            <Link
              href="#booking-modal"
              aria-label="Записатись"
              rel="noopener noreferrer"
              className="inline-block px-10 py-3.5 border border-[#bd9b7d] text-[#4a3f39] text-[11px] uppercase tracking-[2px] font-medium rounded-full transition-all duration-500 hover:bg-[#bd9b7d] hover:text-[#fdfbf7]"
            >
              Записатись
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default About;
