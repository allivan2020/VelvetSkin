'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    experience: string;
    selections: string[];
    name: string;
    contact: string;
  }) => void;
}

const QuizModal = ({ isOpen, onClose, onSubmit }: QuizModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    experience: '',
    selections: [] as string[],
    name: '',
    contact: '',
  });

  // ДОДАНО: Стейт для помилок валідації
  const [errors, setErrors] = useState({ name: '', contact: '' });

  const handleClose = () => {
    setStep(1);
    setFormData({ experience: '', selections: [], name: '', contact: '' });
    setErrors({ name: '', contact: '' }); // Очищаємо помилки при закритті
    onClose();
  };

  const handleExperienceSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, experience: value, selections: [] }));
    setStep(2);
  };

  const toggleSelection = (option: string) => {
    setFormData((prev) => {
      const isSelected = prev.selections.includes(option);
      if (isSelected) {
        return {
          ...prev,
          selections: prev.selections.filter((item) => item !== option),
        };
      } else {
        return { ...prev, selections: [...prev.selections, option] };
      }
    });
  };

  // ДОДАНО: Функція валідації
  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', contact: '' };

    // 1. Валідація імені (мінімум 2 символи, не пусте)
    if (formData.name.trim().length < 2) {
      newErrors.name = "Ім'я має містити щонайменше 2 літери";
      isValid = false;
    }

    // 2. Валідація контакту
    const contactStr = formData.contact.replace(/\s/g, '').trim(); // прибираємо пробіли для перевірки

    if (contactStr.startsWith('@')) {
      // Якщо Telegram (мінімум @ + 3 символи)
      if (contactStr.length < 4) {
        newErrors.contact = 'Введіть коректний нік Telegram (напр. @username)';
        isValid = false;
      }
    } else {
      // Якщо телефон (має бути +380 і 9 цифр)
      const phoneRegex = /^\+380\d{9}$/;
      if (!phoneRegex.test(contactStr)) {
        newErrors.contact =
          'Введіть коректний номер (напр. +380501234567) або @нік';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Перевіряємо перед відправкою
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  if (!isOpen) return null;

  const options =
    formData.experience === 'Новачок'
      ? [
          'Мінімізація дискомфорту',
          'Догляд та рекомендації майстра',
          'Швидкість процедури',
          'Консультація щодо вростання',
        ]
      : [
          'Глибоке бікіні',
          'Ноги повністю',
          'Гомілки / Стегна',
          'Пахви',
          'Обличчя (вусики)',
        ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-[#231d19]/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-[#fcfaf8] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#4a3f39]/50 hover:text-[#4a3f39] transition-colors"
          aria-label="Закрити"
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

        <div className="w-full h-1 bg-[#4a3f39]/10">
          <div
            className="h-full bg-[#bd9b7d] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* ШАГ 1 */}
          {step === 1 && (
            // ... (Код кроку 1 без змін)
            <div className="flex flex-col gap-6">
              <h3 className="font-cormorant text-3xl text-[#4a3f39] text-center mb-2">
                Ви вже були у нас?
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleExperienceSelect('Новачок')}
                  className="w-full py-4 px-6 text-left border border-[#bd9b7d]/30 rounded-xl font-poppins text-[14px] text-[#4a3f39] hover:bg-[#bd9b7d]/10 transition-colors"
                >
                  Ні, планую прийти вперше
                </button>
                <button
                  onClick={() => handleExperienceSelect('Постійний')}
                  className="w-full py-4 px-6 text-left border border-[#bd9b7d]/30 rounded-xl font-poppins text-[14px] text-[#4a3f39] hover:bg-[#bd9b7d]/10 transition-colors"
                >
                  Так, я ваш постійний клієнт
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 2 */}
          {step === 2 && (
            // ... (Код кроку 2 без змін)
            <div className="flex flex-col gap-6">
              <div className="text-center mb-2">
                <h3 className="font-cormorant text-3xl text-[#4a3f39] mb-1">
                  {formData.experience === 'Новачок'
                    ? 'Що для вас найважливіше?'
                    : 'Які зони плануєте зробити?'}
                </h3>
                <p className="font-poppins text-[11px] text-[#4a3f39]/60 uppercase tracking-[1px]">
                  Можна обрати декілька варіантів
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {options.map((option) => {
                  const isSelected = formData.selections.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleSelection(option)}
                      className={clsx(
                        'w-full py-3 px-6 text-left border rounded-xl font-poppins text-[14px] transition-all flex items-center justify-between',
                        isSelected
                          ? 'border-[#bd9b7d] bg-[#bd9b7d]/10 text-[#4a3f39] font-medium'
                          : 'border-[#bd9b7d]/30 bg-transparent text-[#4a3f39] hover:bg-[#bd9b7d]/5',
                      )}
                    >
                      {option}
                      <div
                        className={clsx(
                          'w-5 h-5 rounded flex items-center justify-center transition-colors border',
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.selections.length === 0}
                  className="w-full py-3.5 bg-[#4a3f39] disabled:bg-[#4a3f39]/30 disabled:cursor-not-allowed text-white rounded-xl font-poppins text-[13px] uppercase tracking-[1px] transition-colors"
                >
                  Далі
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-[12px] font-poppins text-[#bd9b7d] underline text-center mt-2"
                >
                  Назад
                </button>
              </div>
            </div>
          )}

          {/* ШАГ 3: З валідацією */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h3 className="font-cormorant text-3xl text-[#4a3f39] text-center mb-1">
                Майже готово!
              </h3>

              <div className="bg-[#bd9b7d]/10 p-4 rounded-xl text-center mb-2">
                <p className="font-poppins text-[13px] text-[#4a3f39]">
                  Залиште ваші контакти, і ми надішлемо вам актуальні
                  <span className="font-semibold text-[#a6856a]">
                    {' '}
                    вільні віконця{' '}
                  </span>
                  для запису у Запоріжжі.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Поле Ім'я */}
                <div className="relative">
                  <label htmlFor="quiz-name" className="sr-only">
                    Ваше ім'я
                  </label>
                  <input
                    id="quiz-name"
                    name="name"
                    type="text"
                    required
                    maxLength={50}
                    autoComplete="name"
                    aria-label="Введіть ваше ім'я"
                    placeholder="Ваше ім'я"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' }); // прибираємо помилку при вводі
                    }}
                    className={clsx(
                      'w-full py-3 px-5 bg-transparent border rounded-xl font-poppins text-[14px] text-[#4a3f39] outline-none transition-colors',
                      errors.name
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4a3f39]/20 focus:border-[#bd9b7d]',
                    )}
                  />
                  {/* Повідомлення про помилку */}
                  {errors.name && (
                    <p className="text-red-500 text-[11px] font-poppins mt-1 pl-2">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Поле Контакт (+380) */}
                <div className="relative">
                  <label htmlFor="quiz-contact" className="sr-only">
                    Номер телефону або Telegram
                  </label>
                  <input
                    id="quiz-contact"
                    name="contact"
                    type="tel"
                    required
                    maxLength={50}
                    autoComplete="tel"
                    aria-label="Введіть номер телефону або нік в Telegram"
                    placeholder="+380 XX XXX XX XX або @telegram"
                    value={formData.contact}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.startsWith('0')) {
                        val = '+380' + val.slice(1);
                      } else if (
                        val.length === 1 &&
                        /[1-9]/.test(val) &&
                        val !== '+'
                      ) {
                        val = '+380' + val;
                      }
                      setFormData({ ...formData, contact: val });
                      if (errors.contact) setErrors({ ...errors, contact: '' }); // прибираємо помилку при вводі
                    }}
                    className={clsx(
                      'w-full py-3 px-5 bg-transparent border rounded-xl font-poppins text-[14px] text-[#4a3f39] outline-none transition-colors',
                      errors.contact
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#4a3f39]/20 focus:border-[#bd9b7d]',
                    )}
                  />
                  {/* Повідомлення про помилку */}
                  {errors.contact && (
                    <p className="text-red-500 text-[11px] font-poppins mt-1 pl-2">
                      {errors.contact}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  aria-label="Відправити дані та отримати вільні віконця"
                  className="w-full mt-2 py-3.5 bg-[#bd9b7d] hover:bg-[#a6856a] text-white rounded-xl font-poppins text-[13px] uppercase tracking-[1px] font-medium transition-colors shadow-[0_4px_15px_rgba(189,155,125,0.3)] active:scale-95"
                >
                  Підібрати час
                </button>
              </form>

              <button
                onClick={() => setStep(2)}
                aria-label="Повернутися на попередній крок"
                className="text-[12px] font-poppins text-[#bd9b7d] underline text-center mt-2"
              >
                Назад
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
