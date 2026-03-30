'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';

// Заглушка, пока не приехали реальные фото
const placeholderImage = '/img/man-price.jpg';

const galleryImages = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  src: placeholderImage,
  alt: `Приклад роботи ${i + 1}`,
}));

const Gallery = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section className="py-24 bg-[#fcfaf8] min-h-screen" />;

  return (
    <section
      id="gallery"
      className="relative py-24 bg-[#fcfaf8] overflow-hidden"
    >
      {/* SVG Шум (генерируется прямо в браузере) */}
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4">
        <header className="text-center mb-20">
          <p className="font-poppins text-[13px] uppercase tracking-[4px] text-[#fcb25e] mb-4 font-semibold">
            Естетика результату
          </p>
          <h2 className="font-vibes text-[clamp(42px,8vw,84px)] text-[#535353] leading-none">
            Luxe Moments
          </h2>
          <div className="w-24 h-[1px] bg-[#fcb25e]/40 mx-auto mt-8" />
        </header>

        {/* Сетка - КРИТИЧНО: добавили relative для корректного скролла */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 max-w-[1200px] mx-auto">
          {galleryImages.map((img, index) => (
            <GalleryItem
              key={img.id}
              img={img}
              index={index}
              onClick={() => setSelectedIndex(index)}
            />
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
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const GalleryItem = ({ img, index, onClick }: any) => {
  const ref = useRef(null);

  // Наклон карточек
  const rotate = (index % 2 === 0 ? 1 : -1) * ((index * 3) % 8);
  const depth = ((index % 3) + 1) * 0.12;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -120 * depth]);

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate: `${rotate}deg` }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
      onClick={onClick}
      className="relative aspect-[3/4] bg-white p-2 shadow-xl cursor-zoom-in group"
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
          sizes="(max-width: 768px) 45vw, 25vw"
        />
      </div>
    </motion.div>
  );
};

const Lightbox = ({ images, index, onClose, setIndex }: any) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((index + 1) % images.length);
      if (e.key === 'ArrowLeft')
        setIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [index, images.length, onClose, setIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-8 right-8 text-white/50 text-5xl font-thin hover:text-white z-[110]"
        onClick={onClose}
      >
        &times;
      </button>

      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-5xl h-[80vh]"
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

      <button
        className="absolute left-4 md:left-8 text-white/30 text-6xl font-thin hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          setIndex((index - 1 + images.length) % images.length);
        }}
      >
        &#8249;
      </button>
      <button
        className="absolute right-4 md:right-8 text-white/30 text-6xl font-thin hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          setIndex((index + 1) % images.length);
        }}
      >
        &#8250;
      </button>
    </motion.div>
  );
};

export default Gallery;
