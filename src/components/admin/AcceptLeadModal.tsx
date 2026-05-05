'use client';

import { useState } from 'react';
import { format } from 'date-fns';

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
  onConfirm: (date: string, time: string) => void;
}

export default function AcceptLeadModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
}: AcceptLeadModalProps) {
  // Инициализируем стейт сразу при рендере, избавляясь от useEffect
  const [date, setDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onConfirm(date, time);
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
              <span className="font-semibold">{lead.name}</span>
            </p>
            <p>
              <span className="text-gray-500">Телефон:</span>{' '}
              <span className="font-semibold">
                {lead.contact || lead.phone}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Послуга:</span>{' '}
              <span className="font-semibold">{services || 'Не вказано'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Дата
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Час</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-all"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={!date || !time}
                className="flex-1 px-4 py-2.5 text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-sm shadow-green-200"
              >
                Підтвердити
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
