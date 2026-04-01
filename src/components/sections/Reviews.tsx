'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Описуємо тип нашого відгуку з бази
interface ReviewType {
  _id: string;
  name: string;
  text: string;
  date: string;
  source: string;
  link: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', text: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Завантажуємо схвалені відгуки з нашого API
  useEffect(() => {
    const fetchApprovedReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Помилка завантаження відгуків', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedReviews();
  }, []);

  // Навігація слайдера
  const nextReview = () => {
    if (reviews.length > 0)
      setActiveIndex((prev) => (prev + 1) % reviews.length);
  };
  const prevReview = () => {
    if (reviews.length > 0)
      setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Відправка нового відгуку
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSubmitted(false);
          setFormData({ name: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Помилка мережі', error);
    }
  };

  return (
    <section
      id="reviews"
      className="relative py-24 md:py-32 overflow-hidden bg-[#fdfbf7]"
    >
      <div className="absolute top-10 left-[-10%] w-[500px] h-[500px] bg-[#bd9b7d]/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-[-10%] w-[600px] h-[600px] bg-[#e3d5c8]/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-16">
          <p className="font-poppins text-[10px] md:text-[11px] uppercase tracking-[6px] text-[#917152] mb-4 font-bold">
            Відгуки
          </p>
          <h2 className="font-vibes text-[clamp(48px,6vw,72px)] text-[#1a1614] leading-[1.1]">
            Ваші <span className="text-[#917152]">історії</span> гладкості
          </h2>
        </header>

        {/* Слайдер або стан завантаження/порожнечі */}
        <div className="relative h-[420px] w-full max-w-5xl mx-auto flex justify-center items-center touch-pan-y mb-10">
          {isLoading ? (
            <p className="font-poppins text-[#917152] animate-pulse uppercase tracking-[3px] text-xs">
              Завантаження...
            </p>
          ) : reviews.length === 0 ? (
            <div className="text-center">
              <p className="font-cormorant text-2xl text-[#4a3f39] italic mb-4">
                Поки що немає відгуків.
              </p>
              <p className="font-poppins text-[#bd9b7d] text-xs uppercase tracking-[2px]">
                Будьте першими!
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {reviews.map((review, index) => {
                let offset = index - activeIndex;
                const total = reviews.length;
                if (offset > Math.floor(total / 2)) offset -= total;
                if (offset < -Math.floor(total / 2)) offset += total;

                const isActive = offset === 0;

                return (
                  <motion.div
                    key={review._id}
                    initial={false}
                    animate={{
                      x: offset === 0 ? '0%' : offset > 0 ? '105%' : '-105%',
                      scale: isActive ? 1 : 0.85,
                      filter: isActive ? 'blur(0px)' : 'blur(5px)',
                      opacity: isActive ? 1 : 0.5,
                      zIndex: isActive ? 10 : 5,
                    }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset: dragOffset }) => {
                      if (dragOffset.x < -50) nextReview();
                      else if (dragOffset.x > 50) prevReview();
                    }}
                    onClick={() => {
                      if (offset === 1) nextReview();
                      if (offset === -1) prevReview();
                    }}
                    className={`absolute w-full max-w-[340px] md:max-w-[420px] p-8 rounded-3xl bg-white/50 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(145,113,82,0.08)] ${
                      isActive
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer'
                    }`}
                  >
                    <div>
                      <span className="font-vibes text-[60px] text-[#bd9b7d]/40 leading-none absolute top-4 left-6">
                        &ldquo;
                      </span>
                      <p className="font-cormorant italic text-[18px] md:text-[20px] leading-[1.6] text-[#4a3f39] mt-6 mb-6 relative z-10 line-clamp-6">
                        {review.text}
                      </p>
                    </div>

                    <div className="flex items-end justify-between border-t border-[#bd9b7d]/10 pt-4">
                      <div>
                        <h3 className="font-poppins text-[13px] uppercase tracking-[2px] text-[#1a1614] font-bold">
                          {review.name}
                        </h3>
                        <span className="text-[#bd9b7d]/80 text-[10px] font-light tracking-[1px] block mt-1">
                          {review.date}
                        </span>
                      </div>
                      {review.link && review.link !== '#' && (
                        <Link
                          href={review.link}
                          target="_blank"
                          onClick={(e) => !isActive && e.preventDefault()}
                          className="text-[9px] uppercase tracking-[1px] text-[#bd9b7d] hover:text-[#1a1614] transition-colors"
                        >
                          {review.source} ↗
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Навігація (ховаємо, якщо відгуків менше 2) */}
        {reviews.length > 1 && (
          <div className="flex justify-center items-center gap-12 md:gap-16 mb-16 relative z-20">
            <button
              onClick={prevReview}
              aria-label="Попередній відгук"
              className="group flex items-center gap-4 text-[#bd9b7d]"
            >
              <div className="w-12 h-[1px] bg-[#bd9b7d]/30 group-hover:w-16 group-hover:bg-[#bd9b7d] transition-all duration-500" />
              <span className="text-[10px] uppercase tracking-[3px] font-medium hidden md:block">
                Prev
              </span>
            </button>
            <div className="flex gap-3">
              {reviews.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'bg-[#bd9b7d] scale-125' : 'bg-[#bd9b7d]/30'}`}
                />
              ))}
            </div>
            <button
              onClick={nextReview}
              aria-label="Наступний відгук"
              className="group flex items-center gap-4 text-[#bd9b7d]"
            >
              <span className="text-[10px] uppercase tracking-[3px] font-medium hidden md:block">
                Next
              </span>
              <div className="w-12 h-[1px] bg-[#bd9b7d]/30 group-hover:w-16 group-hover:bg-[#bd9b7d] transition-all duration-500" />
            </button>
          </div>
        )}

        {/* Кнопка виклику модального вікна */}
        <div className="text-center mt-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-poppins text-[11px] uppercase tracking-[3px] text-[#1a1614] overflow-hidden rounded-full bg-white/50 backdrop-blur-md border border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all hover:bg-white/80 hover:shadow-[0_4px_20px_rgba(145,113,82,0.15)]"
          >
            Залишити відгук
          </button>
        </div>
      </div>

      {/* Модальне вікно форми */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#1a1614]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-8 md:p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-2xl"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-[#1a1614]/50 hover:text-[#1a1614] transition-colors"
              >
                ✕
              </button>
              {isSubmitted ? (
                <div className="text-center py-10">
                  <h3 className="font-vibes text-[40px] text-[#917152] mb-2">
                    Дякуємо!
                  </h3>
                  <p className="font-poppins text-[12px] text-[#4a3f39]">
                    Ваш відгук відправлено. Він з'явиться на сайті після
                    перевірки.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-vibes text-[42px] text-[#1a1614] mb-6 text-center leading-none">
                    Ваш відгук
                  </h3>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                      type="text"
                      required
                      placeholder="Ваше ім'я"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-white/80 focus:outline-none focus:border-[#bd9b7d]/50 font-poppins text-[13px] text-[#1a1614] placeholder-[#4a3f39]/40 transition-all shadow-inner"
                    />
                    <textarea
                      required
                      placeholder="Поділіться своїми враженнями..."
                      rows={4}
                      value={formData.text}
                      onChange={(e) =>
                        setFormData({ ...formData, text: e.target.value })
                      }
                      className="w-full px-5 py-4 rounded-2xl bg-white/60 border border-white/80 focus:outline-none focus:border-[#bd9b7d]/50 font-poppins text-[13px] text-[#1a1614] placeholder-[#4a3f39]/40 transition-all resize-none shadow-inner"
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full py-4 rounded-2xl bg-[#917152] text-white font-poppins text-[11px] uppercase tracking-[3px] hover:bg-[#7a5e43] transition-colors shadow-lg shadow-[#917152]/20"
                    >
                      Надіслати
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Reviews;
