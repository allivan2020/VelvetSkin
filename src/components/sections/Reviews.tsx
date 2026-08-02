'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  formatReviewDateUTC,
  type ApprovedReview,
} from '@/lib/review-date';

interface ReviewType {
  _id: string;
  name: string;
  text: string;
  createdAt: string;
  formattedDate?: string;
  source?: string;
  link?: string;
}

const Reviews = ({
  initialReviews = [],
}: {
  initialReviews?: ApprovedReview[];
}) => {
  const t = useTranslations('Reviews');

  const [reviews, setReviews] = useState<ReviewType[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(initialReviews.length === 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', text: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialReviews.length > 0) return;

    let cancelled = false;
    const fetchApprovedReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setReviews(
              (data as ReviewType[]).map((review) => ({
                ...review,
                formattedDate:
                  review.formattedDate ||
                  formatReviewDateUTC(review.createdAt),
              })),
            );
          }
        }
      } catch (error) {
        console.error('Error loading reviews', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchApprovedReviews();
    return () => {
      cancelled = true;
    };
  }, [initialReviews.length]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const nextReview = () => {
    if (reviews.length > 0)
      setActiveIndex((prev) => (prev + 1) % reviews.length);
  };
  const prevReview = () => {
    if (reviews.length > 0)
      setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
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
      console.error('Submit error', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="reviews"
      className="relative py-28 md:py-36 overflow-hidden bg-brand-paper"
    >
      <div className="relative z-10 container mx-auto px-4 md:px-[5%]">
        <header className="text-center mb-16 md:mb-20">
          <p className="section-eyebrow">{t('subtitle')}</p>
          <h2 className="section-title">
            {t.rich('title', {
              span: (chunks) => (
                <span className="section-title-accent">{chunks}</span>
              ),
            })}
          </h2>
        </header>

        <div className="relative h-[400px] w-full max-w-5xl mx-auto flex justify-center items-center touch-pan-y mb-10">
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <p className="font-poppins text-brand-bronze animate-pulse uppercase tracking-[0.25em] text-[10px] font-medium">
                {t('loading')}
              </p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center">
              <p className="font-cormorant text-2xl text-brand-muted italic mb-4">
                {t('emptyTitle')}
              </p>
              <p className="font-poppins text-brand-soft text-[10px] uppercase tracking-[0.2em] font-medium">
                {t('emptySubtitle')}
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
                const formattedDate =
                  review.formattedDate ||
                  formatReviewDateUTC(review.createdAt);

                return (
                  <motion.div
                    key={review._id}
                    initial={false}
                    animate={{
                      x: offset === 0 ? '0%' : offset > 0 ? '105%' : '-105%',
                      scale: isActive ? 1 : 0.92,
                      opacity: isActive ? 1 : 0.35,
                      zIndex: isActive ? 10 : 5,
                    }}
                    transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, { offset: dragOffset }) => {
                      if (dragOffset.x < -50) nextReview();
                      else if (dragOffset.x > 50) prevReview();
                    }}
                    className={`absolute w-full max-w-[340px] md:max-w-[400px] p-8 md:p-10 rounded-[28px] glass ${
                      isActive
                        ? 'cursor-grab active:cursor-grabbing'
                        : 'cursor-pointer'
                    }`}
                    onClick={() => {
                      if (offset === 1) nextReview();
                      if (offset === -1) prevReview();
                    }}
                  >
                    <p className="font-cormorant italic text-[19px] md:text-[21px] leading-[1.55] text-brand-ink/80 mb-8 relative z-10 line-clamp-6">
                      “{review.text}”
                    </p>

                    <div className="flex items-end justify-between border-t border-brand-line pt-5">
                      <div>
                        <h3 className="font-poppins text-[11px] uppercase tracking-[0.18em] text-brand-ink font-medium">
                          {review.name}
                        </h3>
                        <span className="text-brand-bronze text-[10px] font-medium block mt-1.5">
                          {formattedDate}
                        </span>
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.12em] font-medium text-right">
                        {review.link && review.link !== '#' ? (
                          <Link
                            href={review.link}
                            target="_blank"
                            className="text-brand-bronze hover:text-brand-ink transition-colors"
                          >
                            {review.source || t('sourceDefault')} ↗
                          </Link>
                        ) : (
                          <span className="text-brand-soft">
                            {review.source || t('sourceDefault')}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {reviews.length > 1 && (
          <div className="flex justify-center items-center gap-10 md:gap-14 mb-14 relative z-20">
            <button
              type="button"
              onClick={prevReview}
              aria-label={t('prevAria')}
              className="group flex items-center gap-4 text-brand-bronze"
            >
              <div className="w-10 h-px bg-brand-bronze/30 group-hover:w-14 group-hover:bg-brand-bronze transition-all" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium hidden md:block">
                {t('prev')}
              </span>
            </button>
            <div className="flex gap-2.5">
              {reviews.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-brand-bronze scale-125' : 'bg-brand-bronze/25'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={nextReview}
              aria-label={t('nextAria')}
              className="group flex items-center gap-4 text-brand-bronze"
            >
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium hidden md:block">
                {t('next')}
              </span>
              <div className="w-10 h-px bg-brand-bronze/30 group-hover:w-14 group-hover:bg-brand-bronze transition-all" />
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="glass px-9 py-3.5 font-poppins text-[11px] uppercase tracking-[0.22em] text-brand-ink font-medium rounded-full hover:bg-white/80 transition-all"
          >
            {t('ctaButton')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-ink/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative w-full max-w-lg p-8 md:p-10 rounded-[28px] glass shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label={t('closeAria')}
                className="absolute top-6 right-6 text-brand-ink/40 hover:text-brand-ink p-2"
              >
                ✕
              </button>

              {isSubmitted ? (
                <div className="text-center py-10">
                  <h3 className="font-cormorant text-[36px] text-brand-bronze mb-2 font-light">
                    {t('modal.successTitle')}
                  </h3>
                  <p className="font-poppins text-[12px] text-brand-muted">
                    {t('modal.successText')}
                  </p>
                </div>
              ) : (
                <>
                  <h3
                    id="review-modal-title"
                    className="font-cormorant text-[36px] text-brand-ink mb-6 text-center font-light"
                  >
                    {t('modal.title')}
                  </h3>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                      <label htmlFor="review-name" className="sr-only">
                        {t('modal.namePlaceholder')}
                      </label>
                      <input
                        id="review-name"
                        type="text"
                        required
                        placeholder={t('modal.namePlaceholder')}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-brand-line focus:border-brand-bronze outline-none text-[13px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="review-text" className="sr-only">
                        {t('modal.textPlaceholder')}
                      </label>
                      <textarea
                        id="review-text"
                        required
                        placeholder={t('modal.textPlaceholder')}
                        rows={4}
                        value={formData.text}
                        onChange={(e) =>
                          setFormData({ ...formData, text: e.target.value })
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-brand-line focus:border-brand-bronze outline-none text-[13px] resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="btn-primary mt-2 w-full disabled:opacity-50"
                    >
                      {isSending ? t('modal.sending') : t('modal.send')}
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
