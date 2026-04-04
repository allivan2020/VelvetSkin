'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        'fixed top-0 left-0 w-full z-[100] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isScrolled ? 'py-[15px]' : 'py-[30px] md:py-[40px]',
      )}
    >
      <div
        className={clsx(
          'w-full transition-all duration-700 ease-in-out border border-transparent flex items-center',
          isScrolled
            ? 'max-w-[95%] md:max-w-[85%] mx-auto px-6 py-3 bg-[#fcfaf8]/90 backdrop-blur-xl border-white/40 shadow-[0_10px_40px_rgba(100,80,60,0.08)] rounded-full'
            : 'px-[5%]',
        )}
      >
        <div className="container mx-auto flex items-center justify-between w-full">
          {/* Логотип */}
          <div className="flex flex-col items-start min-w-[120px] sm:min-w-[150px] relative z-[2001]">
            <Link
              href="#hero"
              className={clsx(
                'font-cormorant text-[22px] sm:text-[26px] tracking-[2px] uppercase no-underline leading-none transition-colors duration-500',
                isScrolled && !isMenuOpen ? 'text-[#4a3f39]' : 'text-[#fdfbf7]',
              )}
            >
              Velvet
              <span className="italic font-light text-[#dcb38a] lowercase text-[24px] sm:text-[28px]">
                Skin
              </span>
            </Link>
          </div>

          {/* Меню (Центр) */}
          <nav
            className={clsx(
              'flex gap-8 justify-center flex-grow transition-all duration-500',
              isMenuOpen
                ? 'fixed inset-0 w-full h-[100dvh] bg-[#231d19]/98 backdrop-blur-3xl flex-col items-center justify-center z-[2000]'
                : 'hidden lg:flex',
            )}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'font-poppins text-[11px] uppercase tracking-[2px] transition-all duration-300 no-underline whitespace-nowrap',
                  isMenuOpen
                    ? 'text-[20px] text-[#fdfbf7]/80 hover:text-[#dcb38a] my-4'
                    : isScrolled
                      ? 'text-[#4a3f39]/70 hover:text-[#4a3f39]'
                      : 'text-[#fdfbf7]/70 hover:text-[#fdfbf7]',
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Правая часть: CTA Кнопка + Бургер */}
          <div className="flex items-center gap-3 sm:gap-6 relative z-[2001]">
            {/* CTA Кнопка (теперь видима всегда) */}
            <Link
              href="#booking-modal"
              aria-label="Записатись"
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                'inline-block px-5 py-2 sm:px-8 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] uppercase tracking-[2px] font-medium whitespace-nowrap transition-all duration-500 active:scale-95',
                isScrolled && !isMenuOpen
                  ? 'bg-[#bd9b7d] text-white border border-transparent hover:bg-[#a6856a] shadow-[0_4px_15px_rgba(189,155,125,0.3)]'
                  : 'bg-white/10 border border-[#fdfbf7]/30 text-[#fdfbf7] backdrop-blur-md hover:bg-[#fdfbf7] hover:text-[#231d19]',
              )}
            >
              Записатись
            </Link>

            {/* Бургер для мобилки */}
            <button
              className="lg:hidden flex flex-col gap-[6px] p-2 bg-transparent border-none"
              aria-label={isMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span
                className={clsx(
                  'w-[24px] h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && 'rotate-45 translate-y-[7.5px]',
                )}
              ></span>
              <span
                className={clsx(
                  'w-[24px] h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && 'opacity-0',
                )}
              ></span>
              <span
                className={clsx(
                  'w-[24px] h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && '-rotate-45 -translate-y-[7.5px]',
                )}
              ></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
