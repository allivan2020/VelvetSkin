'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const TURNSTILE_SITE_KEY = '0x4AAAAAACppbzwvZa1GFBX5';

const BookingModal = () => {
  const t = useTranslations('BookingModal');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [formData, setFormData] = useState({
    name: '',
    phone: '+380',
    service: '',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Очистка и закрытие
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setCaptchaToken(null);
      setValidationError(null);
      setFormData({ name: '', phone: '+380', service: '' });
      turnstileRef.current?.reset();
    }, 300); // Соответствует длительности exit анимации
  }, []);

  // Перехват кликов по хешу #booking-modal
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

  // Блокировка прокрутки
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

    if (!captchaToken) {
      setValidationError(t('errors.captcha'));
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contact: formData.phone,
          selections: [formData.service],
          type: 'Запис з кнопки',
          captcha: captchaToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      }

      setStatus('success');
      setTimeout(closeModal, 4000);
    } catch (error) {
      console.error('Submit error:', error);
      setStatus('error');
      // Сбрасываем капчу при ошибке, чтобы можно было отправить повторно
      setCaptchaToken(null);
      turnstileRef.current?.reset();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-[#bd9b7d] transition-colors p-1"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h3 className="font-vibes text-4xl text-[#535353] text-center mb-2">
              {t('title')}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-8 font-medium">
              {t('description')}
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">
                  {t('success.title')}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {t('success.text')}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    disabled={status === 'loading'}
                    placeholder={t('placeholders.name')}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-[#f6f4f0] border-2 border-transparent focus:border-[#f3d9a2] focus:bg-white outline-none transition-all disabled:opacity-50"
                  />

                  <input
                    type="tel"
                    required
                    disabled={status === 'loading'}
                    placeholder="+380 (__) ___ __ __"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="w-full px-5 py-4 rounded-2xl bg-[#f6f4f0] border-2 border-transparent focus:border-[#f3d9a2] focus:bg-white outline-none transition-all disabled:opacity-50"
                  />

                  <select
                    required
                    disabled={status === 'loading'}
                    value={formData.service}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, service: e.target.value }))
                    }
                    className="w-full px-5 py-4 rounded-2xl bg-[#f6f4f0] border-2 border-transparent focus:border-[#f3d9a2] focus:bg-white outline-none cursor-pointer transition-all disabled:opacity-50 appearance-none"
                  >
                    <option value="" disabled>
                      {t('placeholders.service')}
                    </option>
                    <option value="Women's Waxing">
                      {t('services.female')}
                    </option>
                    <option value="Men's Waxing">{t('services.male')}</option>
                  </select>
                </div>

                <div className="flex justify-center my-4 min-h-[65px]">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={setCaptchaToken}
                    onError={() => setStatus('error')}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: 'light' }}
                  />
                </div>

                {(status === 'error' || validationError) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-xl"
                  >
                    <AlertCircle size={16} />
                    <span>{validationError || t('errors.server')}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !captchaToken}
                  className="w-full py-4 mt-2 rounded-full text-white font-bold uppercase tracking-[0.1em] text-[12px] bg-[linear-gradient(160deg,#f3d9a2_0%,#c49f2d_45%,#c49f2d_55%,#a68525_100%)] shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;

