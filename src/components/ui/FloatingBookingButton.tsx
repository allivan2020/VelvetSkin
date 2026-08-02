'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const FloatingBookingButton = () => {
  const t = useTranslations('FloatingButton');

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[90] sm:bottom-8 sm:right-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
    >
      <Link
        href="#booking-modal"
        className="glass group relative flex items-center justify-center px-7 py-3.5 rounded-full no-underline transition-transform duration-500 active:scale-[0.97] hover:shadow-[0_16px_40px_rgba(26,22,20,0.12)]"
      >
        <span className="relative z-10 font-poppins text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-brand-ink">
          {t('text')}
        </span>
      </Link>
    </motion.div>
  );
};

export default FloatingBookingButton;
