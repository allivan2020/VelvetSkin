'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACppbzwvZa1GFBX5';

type PreferredTime = 'morning' | 'afternoon' | 'evening' | '';

const BookingModal = () => {
  const t = useTranslations('BookingModal');
  const turnstileRef = useRef<TurnstileInstance>(null);
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '+380',
    service: '',
  });
  const [preferredTime, setPreferredTime] = useState<PreferredTime>('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setCaptchaToken(null);
      setValidationError(null);
      setPreferredTime('');
      setFormData({ name: '', phone: '+380', service: '' });
      turnstileRef.current?.reset();
    }, 300);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (anchor?.getAttribute('href') === '#booking-modal') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeModal]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val.startsWith('+380')) return;
    const numbers = val.slice(4).replace(/\D/g, '').slice(0, 9);
    setFormData((prev) => ({ ...prev, phone: '+380' + numbers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.phone.length < 13) {
      setValidationError(t('errors.phone'));
      return;
    }

    if (!preferredTime) {
      setValidationError(t('errors.time'));
      return;
    }

    if (!captchaToken) {
      setValidationError(t('errors.captcha'));
      return;
    }

    setStatus('loading');

    const timeLabel = t(`times.${preferredTime}`);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.phone,
          selections: [formData.service, `Час: ${timeLabel}`],
          type: 'Запис з кнопки',
          captcha: captchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      }

      setStatus('success');
      setTimeout(closeModal, 8000);
    } catch (error) {
      console.error('Submit error:', error);
      setStatus('error');
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    }
  };

  const timeOptions: PreferredTime[] = ['morning', 'afternoon', 'evening'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={
              reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 12 }
            }
            transition={{ duration: reduceMotion ? 0.15 : 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            className="relative w-full max-w-md glass rounded-[28px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-6 right-6 text-brand-soft hover:text-brand-bronze transition-colors p-1"
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <p className="font-poppins text-[10px] uppercase tracking-[0.3em] text-brand-bronze mb-4">
                  VelvetSkin
                </p>
                <h3 className="font-cormorant text-[2.25rem] text-brand-ink font-light mb-3">
                  {t('success.title')}
                </h3>
                <p className="text-brand-muted leading-relaxed font-light text-[15px] mb-8 max-w-[320px] mx-auto">
                  {t('success.text')}
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://t.me/velvetskinzp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full"
                  >
                    {t('buttons.telegram')}
                  </a>
                  <a href="tel:+380971950698" className="btn-ghost w-full">
                    {t('buttons.call')}
                  </a>
                </div>
              </motion.div>
            ) : (
              <>
                <h3
                  id="booking-modal-title"
                  className="font-cormorant text-[2.25rem] text-brand-ink text-center mb-2 font-light"
                >
                  {t('title')}
                </h3>
                <p className="text-center text-sm text-brand-muted mb-8 font-light">
                  {t('description')}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="booking-name" className="sr-only">
                        {t('placeholders.name')}
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        required
                        disabled={status === 'loading'}
                        placeholder={t('placeholders.name')}
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-brand-line focus:border-brand-bronze outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="booking-phone" className="sr-only">
                        Phone
                      </label>
                      <input
                        id="booking-phone"
                        type="tel"
                        required
                        disabled={status === 'loading'}
                        placeholder="+380 (__) ___ __ __"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-brand-line focus:border-brand-bronze outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label htmlFor="booking-service" className="sr-only">
                        {t('placeholders.service')}
                      </label>
                      <select
                        id="booking-service"
                        required
                        disabled={status === 'loading'}
                        value={formData.service}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            service: e.target.value,
                          }))
                        }
                        className="w-full px-5 py-4 rounded-2xl bg-white/70 border border-brand-line focus:border-brand-bronze outline-none cursor-pointer transition-all disabled:opacity-50 appearance-none"
                      >
                        <option value="" disabled>
                          {t('placeholders.service')}
                        </option>
                        <option value="Women's Waxing">
                          {t('services.female')}
                        </option>
                        <option value="Men's Waxing">
                          {t('services.male')}
                        </option>
                      </select>
                    </div>

                    <fieldset disabled={status === 'loading'}>
                      <legend className="sr-only">{t('placeholders.time')}</legend>
                      <div className="grid grid-cols-3 gap-2">
                        {timeOptions.map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setPreferredTime(key);
                              setValidationError(null);
                            }}
                            className={clsx(
                              'py-3 rounded-2xl font-poppins text-[11px] uppercase tracking-[0.12em] transition-all border',
                              preferredTime === key
                                ? 'bg-brand-ink text-brand-cream border-brand-ink'
                                : 'bg-white/60 text-brand-muted border-brand-line hover:border-brand-bronze',
                            )}
                          >
                            {t(`times.${key}`)}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>

                  <div className="flex justify-center my-4 min-h-[65px]">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setValidationError(null);
                        if (status === 'error') setStatus('idle');
                      }}
                      onError={() => {
                        setCaptchaToken(null);
                        setValidationError(t('errors.captcha'));
                      }}
                      onExpire={() => setCaptchaToken(null)}
                      options={{
                        theme: 'light',
                        retry: 'auto',
                        refreshExpired: 'auto',
                      }}
                    />
                  </div>

                  {(status === 'error' || validationError) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium bg-red-50/80 p-3 rounded-xl"
                    >
                      <AlertCircle size={16} />
                      <span>{validationError || t('errors.server')}</span>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading' || !captchaToken}
                    className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        {t('buttons.sending')}
                      </>
                    ) : (
                      t('buttons.send')
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
