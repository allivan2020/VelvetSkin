'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const t = useTranslations('Header');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        isScrolled ? 'py-3' : 'py-6 md:py-10',
      )}
    >
      <div
        className={clsx(
          'w-full transition-all duration-700 ease-in-out border border-transparent flex items-center',
          isScrolled
            ? 'glass-nav max-w-[98%] md:max-w-[92%] mx-auto px-4 md:px-8 py-2.5 rounded-full'
            : 'px-[5%]',
        )}
      >
        <div className="container mx-auto flex items-center justify-between w-full">
          <div className="flex-shrink-0 relative z-[2001]">
            <Link
              href="#hero"
              className={clsx(
                'font-cormorant text-[18px] sm:text-[24px] tracking-[0.12em] uppercase no-underline leading-none transition-colors duration-500',
                isScrolled && !isMenuOpen
                  ? 'text-brand-ink'
                  : 'text-brand-hero-fg',
              )}
            >
              Velvet
              <span
                className={clsx(
                  'italic font-light lowercase tracking-normal',
                  isScrolled && !isMenuOpen
                    ? 'text-brand-bronze'
                    : 'text-brand-champagne',
                )}
              >
                Skin
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex gap-6 xl:gap-8 justify-center items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  'font-poppins text-[10px] xl:text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 no-underline whitespace-nowrap',
                  isScrolled
                    ? 'text-brand-muted hover:text-brand-ink'
                    : 'text-brand-hero-fg/70 hover:text-brand-hero-fg',
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 relative z-[2001] flex-shrink-0">
            <div
              className={clsx(
                'transition-colors',
                isScrolled && !isMenuOpen
                  ? 'text-brand-muted'
                  : 'text-brand-hero-fg/80',
              )}
            >
              <LanguageSwitcher />
            </div>

            <Link
              href="#booking-modal"
              onClick={() => setIsMenuOpen(false)}
              className={clsx(
                'inline-flex items-center justify-center px-4 py-2 sm:px-6 md:px-7 rounded-full transition-all duration-500 active:scale-[0.98]',
                isScrolled && !isMenuOpen
                  ? 'bg-brand-ink text-brand-cream hover:bg-brand-bronze'
                  : 'btn-glass',
              )}
            >
              <span className="font-poppins text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.16em] font-medium whitespace-nowrap">
                <span className="lg:hidden">{t('Button.mobile')}</span>
                <span className="hidden lg:inline">{t('Button.desktop')}</span>
              </span>
            </Link>

            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              className="lg:hidden p-2 flex flex-col gap-[5px] flex-shrink-0 bg-transparent border-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-brand-hero-fg'
                    : 'bg-brand-ink',
                  isMenuOpen && 'rotate-45 translate-y-[6.5px]',
                )}
              />
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-brand-hero-fg'
                    : 'bg-brand-ink',
                  isMenuOpen && 'opacity-0',
                )}
              />
              <span
                className={clsx(
                  'w-6 h-[1.5px] transition-all duration-300',
                  isMenuOpen || (!isScrolled && !isMenuOpen)
                    ? 'bg-brand-hero-fg'
                    : 'bg-brand-ink',
                  isMenuOpen && '-rotate-45 -translate-y-[6.5px]',
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-hidden={!isMenuOpen}
        className={clsx(
          'fixed inset-0 w-full h-[100dvh] bg-brand-hero/95 backdrop-blur-3xl flex flex-col items-center justify-center z-[2000] transition-all duration-500',
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="font-cormorant text-[28px] text-brand-hero-fg/85 hover:text-brand-champagne my-3 tracking-wide no-underline"
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
