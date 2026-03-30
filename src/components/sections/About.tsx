'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const About = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Если сервер еще не "договорился" с браузером, показываем пустую секцию, чтобы не было ошибки
  if (!mounted)
    return <section className="py-[clamp(60px,10vw,120px)] bg-white" />;

  return (
    <section
      id="about"
      className="py-[clamp(60px,10vw,120px)] bg-white overflow-hidden"
    >
      <div className="container mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center justify-center gap-[clamp(40px,8vw,100px)] px-[5%]">
        {/* БЛОК С КАРТИНКАМИ */}
        <figure className="relative flex-1 max-w-[500px] w-full lg:w-auto mb-10 lg:mb-0">
          {/* Главное фото */}
          <div className="w-full aspect-[4/5] relative overflow-hidden rounded-t-[200px] shadow-lg">
            <Image
              src="/img/aftor.jpg"
              alt="Майстер депіляції"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="absolute bottom-[-5%] left-[-10%] w-[45%] aspect-[1/1.2] z-[2] overflow-hidden rounded-[15px] border-[8px] border-white shadow-xl">
            <Image
              src="/img/sert.jpg"
              alt="Сертифікат"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority
            />
          </div>
        </figure>
        {/* БЛОК С ТЕКСТОМ */}
        <article className="flex-[1.2] text-left lg:text-left text-center">
          <header>
            <p className="font-poppins text-[13px] uppercase tracking-[4px] text-[#fcb25e] mb-5 font-semibold">
              Естетична косметологія
            </p>
            <h2 className="font-vibes text-[clamp(36px,5vw,56px)] text-[#535353] leading-[1.15] mb-[30px]">
              Професійний догляд <br /> за вашою шкірою
            </h2>
          </header>

          <div className="border-l-[1px] border-[#a68b81]/30 pl-[30px] mb-10 lg:border-l-[1px] lg:border-t-0 border-t-[1px] pt-6 lg:pt-0 max-lg:pl-0">
            <p className="text-[17px] leading-[1.8] text-gray-600 mb-[15px] max-w-[480px] lg:mx-0 mx-auto">
              Ми віримо, що краса — це не лише зовнішній вигляд, а й внутреннє
              відчуття впевненості.
            </p>
            <p className="text-[17px] leading-[1.8] text-gray-600 mb-[15px] max-w-[480px] lg:mx-0 mx-auto">
              Кожна процедура депіляції — це ритуал турботи про себе, виконаний
              з професіоналізмом.
            </p>
            <p className="text-[17px] leading-[1.8] text-gray-600 max-w-[480px] lg:mx-0 mx-auto">
              Velvet<span className="text-[#fcb25e]">Skin</span> — коли турбота
              про себе стає красивим ритуалом.
            </p>
          </div>

          <ul className="flex gap-10 p-0 mb-10 lg:justify-start justify-center">
            <li className="flex flex-col gap-[5px]">
              <span className="text-[24px] font-light text-[#fcb25e]/80">
                01
              </span>
              <span className="text-[12px] uppercase tracking-[1px] text-[#535353] font-semibold">
                Сертифіковані майстри
              </span>
            </li>
            <li className="flex flex-col gap-[5px]">
              <span className="text-[24px] font-light text-[#fcb25e]/80">
                02
              </span>
              <span className="text-[12px] uppercase tracking-[1px] text-[#535353] font-semibold">
                Преміальна косметика
              </span>
            </li>
          </ul>

          <div className="lg:flex lg:justify-start flex justify-center">
            <Link
              href="#booking-modal"
              className="inline-block px-[24px] py-[10px] rounded-[50px] text-white text-[14px] font-medium transition-all duration-300 shadow-md bg-[linear-gradient(160deg,#f3d9a2_0%,#c49f2d_45%,#c49f2d_55%,#a68525_100%)] border border-[#c49f2d] hover:shadow-[0_4px_10px_rgba(212,175,55,0.4)]"
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
