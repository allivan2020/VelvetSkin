'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';

const turnstileOptions = { theme: 'light' as const };

const BookingModal = () => {
  const t = useTranslations('BookingModal');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target?.closest('a');
      if (anchor && anchor.getAttribute('href') === '#booking-modal') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setCaptchaToken(null);
      setValidationError(null);
    }, 500);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+380')) val = '+380';
    const numbers = val.slice(4).replace(/\D/g, '');
    setFormData({ ...formData, phone: '+380' + numbers.slice(0, 9) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.phone.length !== 13) {
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
          ...formData,
          status: 'Новий',
          type: 'Запис з кнопки',
          captcha: captchaToken,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '+380', service: '' });
        setCaptchaToken(null);
        setTimeout(closeModal, 4000);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setStatus('error');
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
            className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-[#535353] hover:text-[#bd9b7d] transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-vibes text-4xl text-[#535353] text-center mb-2">
              {t('title')}
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6 font-medium">
              {t('description')}
            </p>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4 className="text-2xl font-medium text-[#bd9b7d] mb-3">
                  {t('success.title')}
                </h4>
                <p className="text-[#535353]">{t('success.text')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  required
                  placeholder={t('placeholders.name')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="+380 (__) ___ __ __"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] outline-none"
                />
                <select
                  required
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    {t('placeholders.service')}
                  </option>
                  <option value="Women's Waxing">{t('services.female')}</option>
                  <option value="Men's Waxing">{t('services.male')}</option>
                </select>

                <div className="flex justify-center my-2">
                  <Turnstile
                    siteKey="0x4AAAAAACppbzwvZa1GFBX5"
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setStatus('error')}
                    options={turnstileOptions}
                  />
                </div>

                {(status === 'error' || validationError) && (
                  <p className="text-red-500 text-xs text-center font-medium">
                    {validationError || t('errors.server')}
                  </p>
                )}

                <button
                  aria-label="Close modal"
                  type="submit"
                  disabled={status === 'loading' || !captchaToken}
                  className="w-full py-4 rounded-full text-white font-bold uppercase tracking-wider text-[11px] bg-[linear-gradient(160deg,#f3d9a2_0%,#c49f2d_45%,#c49f2d_55%,#a68525_100%)] shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {status === 'loading'
                    ? t('buttons.sending')
                    : t('buttons.send')}
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
