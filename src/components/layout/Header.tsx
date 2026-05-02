'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

// Іконка/Бейдж "Free"
const FreeIcon = ({ text }: { text: string }) => (
  <span className="flex items-center justify-center bg-[#dcb38a] text-[#231d19] text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter mr-2 shadow-sm">
    {text}
  </span>
);

const Header = () => {
  // 1. Инициализируем хук для раздела "Header" из нашего JSON
  const t = useTranslations('Header');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Заменяем хардкод на ключи из словаря
  const navLinks = [
    { name: t('Nav.home'), href: '#hero' },
    { name: t('Nav.about'), href: '#about' },
    { name: t('Nav.services'), href: '#story' },
    { name: t('Nav.atmosphere'), href: '#gallery' },
    { name: t('Nav.faq'), href: '#faq' },
    { name: t('Nav.reviews'), href: '#reviews' },
    { name: t('Nav.contacts'), href: '#contacts' },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 w-full z-[100] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isScrolled ? 'py-[10px]' : 'py-[25px] md:py-[40px]',
      )}
    >
      <div
        className={clsx(
          'w-full transition-all duration-700 ease-in-out border border-transparent flex items-center',
          isScrolled
            ? 'max-w-[98%] md:max-w-[90%] mx-auto px-4 md:px-8 py-2.5 bg-[#fcfaf8]/95 backdrop-blur-xl border-white/40 shadow-lg rounded-full'
            : 'px-[5%]',
        )}
      >
        <div className="container mx-auto flex items-center justify-between w-full">
          {/* Логотип */}
          <div className="flex-shrink-0 relative z-[2001]">
            <Link
              href="#hero"
              className={clsx(
                'font-cormorant text-[18px] sm:text-[24px] tracking-[1px] uppercase no-underline leading-none transition-colors duration-500',
                isScrolled && !isMenuOpen ? 'text-[#4a3f39]' : 'text-[#fdfbf7]',
              )}
            >
              Velvet
              <span className="italic font-light text-[#dcb38a] lowercase">
                Skin
              </span>
            </Link>
          </div>

          {/* Десктопне меню */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 justify-center items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'font-poppins text-[10px] xl:text-[11px] uppercase tracking-[2px] transition-all duration-300 no-underline whitespace-nowrap',
                  isScrolled
                    ? 'text-[#4a3f39]/70 hover:text-[#4a3f39]'
                    : 'text-[#fdfbf7]/70 hover:text-[#fdfbf7]',
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Кнопка + Бургер */}
          <div className="flex items-center gap-2 sm:gap-4 relative z-[2001] flex-shrink-0">
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {/* <button className="...">{t('Button.desktop')}</button> */}
            </div>
            {/* CTA Кнопка */}
            <Link
              href="#booking-modal"
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                'inline-flex items-center justify-center px-3 py-2 sm:px-6 md:px-8 rounded-full transition-all duration-500 active:scale-95',
                isScrolled && !isMenuOpen
                  ? 'bg-[#4a3f39] text-white shadow-md'
                  : 'bg-white/10 border border-[#fdfbf7]/30 text-[#fdfbf7] backdrop-blur-md hover:bg-[#fdfbf7] hover:text-[#231d19]',
              )}
            >
              {/* 3. Передаем переведенный текст в иконку */}
              <FreeIcon text={t('Free')} />
              <span className="font-poppins text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[1px] font-medium whitespace-nowrap">
                {/* 4. Заменяем текст кнопок */}
                <span className="lg:hidden">{t('Button.mobile')}</span>
                <span className="hidden lg:inline">{t('Button.desktop')}</span>
              </span>
            </Link>

            {/* Бургер */}
            <button
              aria-label="Close modal"
              className="lg:hidden p-2 flex flex-col gap-[5px] flex-shrink-0 bg-transparent border-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && 'rotate-45 translate-y-[6.5px]',
                )}
              ></span>
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && 'opacity-0',
                )}
              ></span>
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-[#fdfbf7]'
                    : 'bg-[#4a3f39]',
                  isMenuOpen && '-rotate-45 -translate-y-[6.5px]',
                )}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Мобільне меню */}
      <nav
        className={clsx(
          'fixed inset-0 w-full h-[100dvh] bg-[#231d19]/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[2000] transition-all duration-500',
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="font-poppins text-[20px] text-[#fdfbf7]/80 hover:text-[#dcb38a] my-4 uppercase tracking-[3px] no-underline"
            onClick={() => setIsMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;
