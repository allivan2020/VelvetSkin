'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string; // Додали поле title для SEO
}

// SEO-оптимізація: додаємо ключові слова (депіляція, Запоріжжя, VelvetSkin) до alt та title
const galleryImages: GalleryItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  src: `/img/gallery/res-${i + 1}.webp`,
  alt: `Професійна воскова депіляція Запоріжжя - результат процедури VelvetSkin №${i + 1}`,
  title: `Фото результату депіляції VelvetSkin №${i + 1}`,
}));

const Gallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section
      id="gallery"
      aria-label="Галерея результатів воскової депіляції" // Допомагає пошуковикам зрозуміти контент секції
      className="relative py-32 md:py-48 bg-[#fdfbf7] overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-20 md:mb-32">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-6 font-bold">
            Естетика результату
          </p>
          <h2 className="font-vibes text-[clamp(60px,8vw,90px)] text-[#1a1614] leading-[0.9]">
            Luxe <span className="text-[#917152]">Moments</span>
          </h2>
        </header>

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
                title={img.title} // Підказка при наведенні
                fill
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Трохи уточнив sizes для кращого підбору розміру браузером
              />
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

interface LightboxProps {
  images: GalleryItem[];
  index: number;
  onClose: () => void;
  setIndex: (index: number) => void;
}

const Lightbox = ({ images, index, onClose, setIndex }: LightboxProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Устанавливаем z-index выше хедера
      className="fixed inset-0 z-[9999] bg-[#231d19]/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
      onClick={onClose} // Закрытие по клику на фон
      role="dialog"
      aria-modal="true"
    >
      {/* Кнопка закрытия */}
      <button
        className="absolute top-6 right-6 md:top-10 md:right-10 text-white/50 text-4xl font-light hover:text-white transition-colors z-[10001] p-4"
        onClick={(e) => {
          e.stopPropagation(); // Чтобы клик по крестику не дублировался
          onClose();
        }}
        aria-label="Закрити галерею"
      >
        &times;
      </button>

      {/* Контейнер изображения */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-5xl h-[60vh] md:h-[80vh] cursor-default"
        onClick={(e) => e.stopPropagation()} // Клик по самому фото НЕ закрывает окно
      >
        <Image
          src={images[index].src}
          alt={images[index].alt}
          fill
          className="object-contain"
          priority
        />
      </motion.div>

      {/* Панель навигации (внизу) */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 text-white/40 font-poppins text-[11px] tracking-[4px] z-[10001]"
        onClick={(e) => e.stopPropagation()} // Клик в зоне кнопок НЕ закрывает окно
      >
        <button
          className="hover:text-[#bd9b7d] transition-colors py-4 px-2"
          onClick={() => setIndex((index - 1 + images.length) % images.length)}
        >
          PREV
        </button>
        <span className="text-[#bd9b7d] font-medium tracking-[1px] min-w-[60px] text-center">
          {index + 1} / {images.length}
        </span>
        <button
          className="hover:text-[#bd9b7d] transition-colors py-4 px-2"
          onClick={() => setIndex((index + 1) % images.length)}
        >
          NEXT
        </button>
      </div>
    </motion.div>
  );
};
export default Gallery;
