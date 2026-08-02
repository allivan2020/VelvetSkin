'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
}

const Gallery = () => {
  const t = useTranslations('Gallery');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const galleryImages: GalleryItem[] = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const id = i + 1;
      return {
        id,
        src: `/img/gallery/res-${id}.webp`,
        alt: t('imageAlt', { id }),
        title: t('imageTitle', { id }),
      };
    });
  }, [t]);

  return (
    <section
      id="gallery"
      aria-label={t('ariaLabel')}
      className="relative py-20 md:py-28 bg-brand-paper overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-12 md:mb-20">
          <p className="section-eyebrow">{t('subtitle')}</p>
          <h2 className="section-title">
            {t.rich('title', {
              span: (chunks) => (
                <span className="section-title-accent">{chunks}</span>
              ),
            })}
          </h2>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-3 max-w-[1400px] mx-auto">
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : Math.min(index, 3) * 0.04 }}
              role="button"
              tabIndex={0}
              aria-label={img.alt}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
              className="relative aspect-square overflow-hidden bg-brand-line cursor-zoom-in group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bronze"
            >
              <Image
                src={img.src}
                alt={img.alt}
                title={img.title}
                fill
                className="object-cover transition-transform duration-[1.1s] ease-out motion-safe:group-hover:scale-[1.05]"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-brand-hero/0 group-hover:bg-brand-hero/10 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            images={galleryImages}
            index={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            setIndex={setSelectedIndex}
            labels={{
              prev: t('prev'),
              next: t('next'),
              close: t('closeLabel'),
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

interface LightboxProps {
  images: GalleryItem[];
  index: number;
  onClose: () => void;
  setIndex: (index: number) => void;
  labels: { prev: string; next: string; close: string };
}

const Lightbox = ({
  images,
  index,
  onClose,
  setIndex,
  labels,
}: LightboxProps) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        setIndex((index - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight') {
        setIndex((index + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, index, onClose, setIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-brand-hero/92 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={images[index]?.alt}
    >
      <button
        className="absolute top-6 right-6 md:top-10 md:right-10 text-white/45 text-4xl font-light hover:text-white transition-colors z-[10001] p-4"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={labels.close}
      >
        &times;
      </button>

      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-5xl h-[60vh] md:h-[80vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index].src}
          alt={images[index].alt}
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 text-white/40 font-poppins text-[11px] tracking-[0.3em] z-[10001]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="hover:text-brand-champagne transition-colors py-4 px-2"
          aria-label={labels.prev}
          onClick={() => setIndex((index - 1 + images.length) % images.length)}
        >
          {labels.prev}
        </button>
        <span className="text-brand-champagne font-medium tracking-[0.1em] min-w-[60px] text-center">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          className="hover:text-brand-champagne transition-colors py-4 px-2"
          aria-label={labels.next}
          onClick={() => setIndex((index + 1) % images.length)}
        >
          {labels.next}
        </button>
      </div>
    </motion.div>
  );
};

export default Gallery;
