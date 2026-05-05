'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react'; // Если используешь lucide-react, если нет — можно заменить на текст

interface Lead {
  _id: string;
  name: string;
  contact: string;
  phone?: string;
  experience?: string;
  selections: string[] | string;
  type?: string;
  status?: string;
  createdAt?: string;
  aiSummary?: string;
}

interface AcceptLeadModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  // Меняем на Promise, чтобы модалка знала, когда запрос завершился
  onConfirm: (date: string, time: string) => Promise<void>;
}

export default function AcceptLeadModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
}: AcceptLeadModalProps) {
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || isLoading) return;

    try {
      setIsLoading(true);
      // Ждем завершения запроса в родительском компоненте
      await onConfirm(date, time);
      // Если все ок — родитель сам закроет модалку через isOpen,
      // либо можно вызвать onClose() здесь, если логика позволяет.
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Помилка при збереженні. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const services = Array.isArray(lead.selections)
    ? lead.selections.join(', ')
    : lead.selections;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Оформити запис
          </h3>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Клієнт:</span>{' '}
              <span className="font-semibold text-gray-900">{lead.name}</span>
            </p>
            <p>
              <span className="text-gray-500">Телефон:</span>{' '}
              <span className="font-semibold text-gray-900">
                {lead.contact || lead.phone}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Послуга:</span>{' '}
              <span className="font-semibold text-gray-900">
                {services || 'Не вказано'}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Дата
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Час
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isLoading || !date || !time}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 rounded-xl font-bold transition-all shadow-sm shadow-green-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Збереження...</span>
                  </>
                ) : (
                  'Підтвердити'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
