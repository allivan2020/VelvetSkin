'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAACppbzwvZa1GFBX5';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    experience: string;
    selections: string[];
    name: string;
    contact: string;
    captcha: string;
  }) => void;
}

const QuizModal = ({ isOpen, onClose, onSubmit }: QuizModalProps) => {
  const t = useTranslations('Quiz');
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    experience: '',
    selections: [] as string[],
    name: '',
    contact: '+380',
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState({ name: '', contact: '', captcha: '' });

  const resetForm = () => {
    setStep(1);
    setFormData({ experience: '', selections: [], name: '', contact: '+380' });
    setErrors({ name: '', contact: '', captcha: '' });
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleExperienceSelect = (key: 'new' | 'regular') => {
    setFormData((prev) => ({
      ...prev,
      experience: t(`steps.step1.options.${key}`),
      selections: [],
    }));
    setStep(2);
  };

  const toggleSelection = (option: string) => {
    setFormData((prev) => {
      const isSelected = prev.selections.includes(option);
      return {
        ...prev,
        selections: isSelected
          ? prev.selections.filter((item) => item !== option)
          : [...prev.selections, option],
      };
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', contact: '', captcha: '' };

    if (formData.name.trim().length < 2) {
      newErrors.name = t('errors.name');
      isValid = false;
    }

    const cleanContact = formData.contact.replace(/[\s\-\(\)]/g, '');

    if (cleanContact.startsWith('@')) {
      if (cleanContact.length < 4) {
        newErrors.contact = t('errors.telegram');
        isValid = false;
      }
    } else {
      const phoneRegex = /^\+380\d{9}$/;
      if (!phoneRegex.test(cleanContact)) {
        newErrors.contact = t('errors.contact');
        isValid = false;
      }
    }

    if (!captchaToken) {
      newErrors.captcha = t('errors.captcha');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && captchaToken) {
      const cleanContact = formData.contact.replace(/[\s\-\(\)]/g, '');
      onSubmit({ ...formData, contact: cleanContact, captcha: captchaToken });
      handleClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStep(1);
        setFormData({
          experience: '',
          selections: [],
          name: '',
          contact: '+380',
        });
        setErrors({ name: '', contact: '', captcha: '' });
        setCaptchaToken(null);
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const experienceKey =
    formData.experience === t('steps.step1.options.new') ? 'new' : 'regular';
  const options = t.raw(`steps.step2.options.${experienceKey}`) as string[];

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-[#231d19]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#fcfaf8] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="w-full h-1 bg-[#4a3f39]/10">
          <div
            className="h-full bg-[#bd9b7d] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <button
          type="button"
          aria-label="Close modal"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#4a3f39]/50 hover:text-[#4a3f39] z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <h3
                id="quiz-modal-title"
                className="font-cormorant text-3xl text-[#4a3f39] text-center mb-2"
              >
                {t('steps.step1.title')}
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleExperienceSelect('new')}
                  className="w-full py-4 px-6 text-left border border-[#bd9b7d]/30 rounded-xl font-poppins text-[14px] text-[#4a3f39] hover:bg-[#bd9b7d]/10 transition-colors"
                >
                  {t('steps.step1.options.new')}
                </button>
                <button
                  type="button"
                  onClick={() => handleExperienceSelect('regular')}
                  className="w-full py-4 px-6 text-left border border-[#bd9b7d]/30 rounded-xl font-poppins text-[14px] text-[#4a3f39] hover:bg-[#bd9b7d]/10 transition-colors"
                >
                  {t('steps.step1.options.regular')}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h3 className="font-cormorant text-3xl text-[#4a3f39] mb-1">
                  {experienceKey === 'new'
                    ? t('steps.step2.titleNew')
                    : t('steps.step2.titleRegular')}
                </h3>
                <p className="font-poppins text-[11px] text-[#4a3f39]/60 uppercase tracking-[1px]">
                  {t('steps.step2.hint')}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((option) => {
                  const isSelected = formData.selections.includes(option);
                  return (
                    <button
                      type="button"
                      key={option}
                      onClick={() => toggleSelection(option)}
                      className={clsx(
                        'w-full py-3 px-6 text-left border rounded-xl font-poppins text-[14px] transition-all flex items-center justify-between',
                        isSelected
                          ? 'border-[#bd9b7d] bg-[#bd9b7d]/10 font-medium'
                          : 'border-[#bd9b7d]/30 hover:bg-[#bd9b7d]/5',
                      )}
                    >
                      {option}
                      <div
                        className={clsx(
                          'w-5 h-5 rounded flex items-center justify-center border',
                          isSelected
                            ? 'bg-[#bd9b7d] border-[#bd9b7d]'
                            : 'border-[#bd9b7d]/50',
                        )}
                      >
                        {isSelected && (
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={formData.selections.length === 0}
                  className="w-full py-3.5 bg-[#4a3f39] disabled:opacity-30 text-white rounded-xl font-poppins text-[13px] uppercase tracking-[1px]"
                >
                  {t('buttons.next')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[12px] font-poppins text-[#bd9b7d] underline mt-2"
                >
                  {t('buttons.back')}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-cormorant text-3xl text-[#4a3f39] text-center mb-1">
                {t('steps.step3.title')}
              </h3>
              <div className="bg-[#bd9b7d]/10 p-4 rounded-xl text-center mb-2">
                <p className="font-poppins text-[13px] text-[#4a3f39]">
                  {t.rich('steps.step3.description', {
                    span: (chunks) => (
                      <span className="font-semibold text-[#a6856a]">
                        {chunks}
                      </span>
                    ),
                  })}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="quiz-name" className="sr-only">
                    {t('placeholders.name')}
                  </label>
                  <input
                    id="quiz-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder={t('placeholders.name')}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={clsx(
                      'w-full py-3 px-5 border rounded-xl outline-none',
                      errors.name
                        ? 'border-red-400'
                        : 'border-[#4a3f39]/20 focus:border-[#bd9b7d]',
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[11px] mt-1 pl-2">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="quiz-contact" className="sr-only">
                    {t('placeholders.contact')}
                  </label>
                  <input
                    id="quiz-contact"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder={t('placeholders.contact')}
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    className={clsx(
                      'w-full py-3 px-5 border rounded-xl outline-none',
                      errors.contact
                        ? 'border-red-400'
                        : 'border-[#4a3f39]/20 focus:border-[#bd9b7d]',
                    )}
                  />
                  {errors.contact && (
                    <p className="text-red-500 text-[11px] mt-1 pl-2">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div className="flex justify-center min-h-[65px]">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => {
                      setCaptchaToken(token);
                      setErrors((prev) => ({ ...prev, captcha: '' }));
                    }}
                    onError={() => setCaptchaToken(null)}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: 'light' }}
                  />
                </div>
                {errors.captcha && (
                  <p className="text-red-500 text-[11px] text-center">
                    {errors.captcha}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!captchaToken}
                  className="w-full mt-2 py-3.5 bg-[#bd9b7d] hover:bg-[#a6856a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-poppins text-[13px] uppercase tracking-[1px] font-medium shadow-lg active:scale-95 transition-all"
                >
                  {t('buttons.submit')}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-[12px] font-poppins text-[#bd9b7d] underline mt-2 text-center"
              >
                {t('buttons.back')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
