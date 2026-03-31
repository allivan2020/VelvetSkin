'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Заглушка
const placeholderImage = '/img/man-price.jpg';

const galleryImages = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  src: placeholderImage,
  alt: `Результат депіляції ${i + 1}`,
}));

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section
      id="gallery"
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#bd9b7d] mb-6 font-medium">
            Естетика результату
          </p>
          <h2 className="font-vibes text-[clamp(42px,6vw,64px)] text-[#231d19] leading-[1.05] font-light">
            Luxe <span className="italic text-[#bd9b7d]">Moments</span>
          </h2>
        </header>

        {/* Ідеальна преміальна сітка */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 max-w-[1400px] mx-auto">
          {galleryImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-square overflow-hidden bg-[#f0ede8] cursor-zoom-in group"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Ледь помітний оверлей при наведенні */}
              <div className="absolute inset-0 bg-[#231d19]/0 group-hover:bg-[#231d19]/10 transition-colors duration-500" />
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
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const Lightbox = ({ images, index, onClose, setIndex }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#231d19]/fb backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        className="absolute top-8 right-8 text-white/50 text-4xl font-light hover:text-white transition-colors z-[110]"
        onClick={onClose}
        aria-label="Закрити галерею"
      >
        &times;
      </button>

      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-5xl h-[70vh] md:h-[85vh]"
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

      {/* Навігація в лайтбоксі */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 text-white/40 font-poppins text-[11px] tracking-[4px]">
        <button
          className="hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((index - 1 + images.length) % images.length);
          }}
        >
          PREV
        </button>
        <span className="text-[#bd9b7d] font-medium tracking-[1px]">
          {index + 1} / {images.length}
        </span>
        <button
          className="hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((index + 1) % images.length);
          }}
        >
          NEXT
        </button>
      </div>
    </motion.div>
  );
};

export default Gallery;
