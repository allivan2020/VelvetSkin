'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const FloatingBookingButton = () => {
  const t = useTranslations('FloatingButton');

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[90] sm:bottom-10 sm:right-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }} // Небольшая задержка, чтобы кнопка не вылетала сразу с Hero
    >
      <Link
        href="#booking-modal"
        className="group relative flex items-center justify-center px-8 py-4 rounded-full bg-white/40 backdrop-blur-xl border border-white/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3),0_0_20px_rgba(252,178,94,0.3)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4),0_0_30px_rgba(252,178,94,0.5)] transition-all duration-500 active:scale-95 no-underline"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f3d9a2]/20 to-[#c49f2d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <span className="relative z-10 font-poppins text-[10px] sm:text-[11px] uppercase tracking-[2px] font-bold text-[#231d19]">
          {t('text')}
        </span>

        {/* Пульсирующая точка-индикатор */}
        <span className="relative flex h-2 w-2 ml-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bd9b7d] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#bd9b7d]"></span>
        </span>
      </Link>
    </motion.div>
  );
};

export default FloatingBookingButton;
