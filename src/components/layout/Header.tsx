'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Ждем монтажа, чтобы избежать ошибки Hydration
  if (!mounted)
    return <header className="fixed top-0 w-full py-[40px] z-[1000]" />;

  const navLinks = [
    { name: 'Головна', href: '#hero' },
    { name: 'Про нас', href: '#about' },
    { name: 'Послуги', href: '#story' },
    { name: 'Атмосфера', href: '#gallery' },
    { name: 'Питання', href: '#faq' },
    { name: 'Відгуки', href: '#reviews' },
    { name: 'Контакти', href: '#contacts' },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 w-full z-[1000] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isScrolled ? 'py-[15px]' : 'py-[40px]',
      )}
    >
      <div
        className={clsx(
          'w-full transition-all duration-500 ease-in-out border border-transparent',
          isScrolled &&
            'max-w-[90%] mx-auto px-[25px] py-[10px] bg-white/10 backdrop-blur-[15px] border-white/20 rounded-[50px] shadow-[0_4px_30px_rgba(0,0,0,0.1)]',
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Логотип: Графит + Золото */}
          <div className="flex flex-col items-start min-w-[150px]">
            <Link
              href="#hero"
              className="font-poppins font-semibold text-[24px] tracking-[2px] uppercase text-[#535353] no-underline leading-none"
            >
              Velvet<span className="font-light text-[#fcb25e]">Skin</span>
            </Link>
          </div>

          {/* Бургер для мобилки */}
          <button
            className="lg:hidden flex flex-col gap-[6px] p-0 bg-transparent border-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span
              className={clsx(
                'w-[25px] h-[2px] bg-[#535353] transition-all',
                isMenuOpen && 'rotate-45 translate-y-2',
              )}
            ></span>
            <span
              className={clsx(
                'w-[25px] h-[2px] bg-[#535353] transition-all',
                isMenuOpen && 'opacity-0',
              )}
            ></span>
            <span
              className={clsx(
                'w-[25px] h-[2px] bg-[#535353] transition-all',
                isMenuOpen && '-rotate-45 -translate-y-2',
              )}
            ></span>
          </button>

          {/* Меню: Золотистые ссылки */}
          <nav
            className={clsx(
              'flex gap-[35px] justify-center flex-grow transition-all duration-500',
              isMenuOpen
                ? 'fixed top-0 left-0 w-full h-screen bg-[#f6f4f0]/98 backdrop-blur-[25px] flex-col items-center justify-center z-[2000]'
                : 'hidden lg:flex',
            )}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'font-poppins font-medium uppercase tracking-[1.5px] transition-colors duration-300 no-underline whitespace-nowrap',
                  isMenuOpen
                    ? 'text-[24px] text-[#535353]'
                    : 'text-[13px] text-[#fcb25e] hover:text-[#d4af37]',
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Золотая кнопка с градиентом */}
          <div className="hidden sm:flex items-center">
            <Link
              href="#booking-modal"
              className="inline-block px-[24px] py-[10px] rounded-[50px] text-white text-[14px] font-medium whitespace-nowrap transition-all duration-300 shadow-md active:translate-y-[1px]
              bg-[linear-gradient(160deg,#f3d9a2_0%,#c49f2d_45%,#c49f2d_55%,#a68525_100%)] 
              border border-[#c49f2d] hover:shadow-[0_4px_10px_rgba(212,175,55,0.4)]"
            >
              Записатись
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
