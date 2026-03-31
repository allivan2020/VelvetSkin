'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Turnstile } from '@marsidev/react-turnstile';

const BookingModal = () => {
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

  // 1. Глобальный перехват кликов
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.getAttribute('href') === '#booking-modal') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // 2. Блокируем скролл
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStatus('idle');
      setCaptchaToken(null);
    }, 500);
  };

  // 3. Жорстка маска для телефону
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Не даємо стерти +380
    if (!val.startsWith('+380')) {
      val = '+380';
    }

    // Вирізаємо всі НЕ-цифри після +380
    const numbers = val.slice(4).replace(/\D/g, '');

    // Обмежуємо довжину до 9 цифр після +380
    setFormData({ ...formData, phone: '+380' + numbers.slice(0, 9) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Додаткова перевірка перед відправкою на всякий випадок
    if (formData.phone.length !== 13) {
      alert(
        'Будь ласка, введіть коректний номер телефону (9 цифр після +380).',
      );
      return;
    }

    if (!captchaToken) {
      alert('Будь ласка, підтвердіть, що ви не робот.');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, captcha: captchaToken }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '+380', service: '' });
        setCaptchaToken(null);
        setTimeout(closeModal, 4000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Server error');
      }
    } catch (error) {
      console.error('Помилка відправки:', error);
      setStatus('error');
      setCaptchaToken(null);
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
              aria-label="Закрити"
              className="absolute top-6 right-6 text-[#535353] hover:text-[#fcb25e] transition-colors"
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
              Записатися на візит
            </h3>
            <p className="text-center text-sm text-gray-500 mb-6 font-medium">
              Залиште контакти, і ми підберемо ідеальний час у Запоріжжі
            </p>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-[#fcb25e]/20 text-[#fcb25e] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4 className="text-2xl font-medium text-[#d4a373] mb-3">
                  Дякуємо, {formData.name}!
                </h4>
                <p className="text-[#535353] text-lg">
                  Ваша заявка успішно надіслана. <br /> Ми зателефонуємо вам
                  найближчим часом.
                </p>
                <button
                  onClick={closeModal}
                  aria-label="Закрити"
                  className="mt-6 px-8 py-3 rounded-full text-white font-medium bg-[#fcb25e] hover:bg-[#d4a373] transition-colors"
                >
                  Зрозуміло
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                  type="text"
                  required
                  placeholder="Ваше ім'я"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  autoComplete="name" // Увімкнули автозаповнення імені
                  minLength={2} // Мінімум 2 символи
                  maxLength={50}
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] border border-transparent focus:border-[#fcb25e] focus:bg-white outline-none transition-all"
                />

                <input
                  type="tel"
                  required
                  placeholder="+380 (__) ___ __ __"
                  value={formData.phone}
                  onChange={handlePhoneChange} // Додали жорстку маску
                  autoComplete="tel" // Увімкнули автозаповнення телефону
                  pattern="^\+380\d{9}$" // Перевірка на рівно 9 цифр після +380
                  title="Номер має містити 9 цифр після +380"
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] border border-transparent focus:border-[#fcb25e] focus:bg-white outline-none transition-all"
                />

                <select
                  required
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-xl bg-[#f6f4f0] border border-transparent focus:border-[#fcb25e] focus:bg-white outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled>
                    Оберіть послугу
                  </option>
                  <option value="Жіноча депіляція">Жіноча депіляція</option>
                  <option value="Чоловіча депіляція">Чоловіча депіляція</option>
                </select>

                <div className="flex justify-center my-2">
                  <Turnstile
                    siteKey="0x4AAAAAACppbzwvZa1GFBX5"
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setStatus('error')}
                    options={{ theme: 'light' }}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm text-center">
                    Виникла помилка. Спробуйте ще раз.
                  </p>
                )}

                <button
                  type="submit"
                  aria-label="Записатись"
                  disabled={status === 'loading' || !captchaToken}
                  className="w-full py-4 rounded-full text-white font-medium transition-all shadow-md bg-[linear-gradient(160deg,#f3d9a2_0%,#c49f2d_45%,#c49f2d_55%,#a68525_100%)] hover:shadow-[0_4px_15px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Надсилаємо...' : 'Надіслати'}
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
