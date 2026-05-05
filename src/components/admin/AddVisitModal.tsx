'use client';

import { useState, useEffect } from 'react';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visit: {
    date: string;
    zones: string[];
    notes: string;
    price: number;
  }) => void;
}

export default function AddVisitModal({
  isOpen,
  onClose,
  onSave,
}: AddVisitModalProps) {
  // Стандартні значення для форми
  const [date, setDate] = useState('');
  const [zones, setZones] = useState('');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');

  // Коли вікно відкривається, ставимо сьогоднішню дату за замовчуванням
useEffect(() => {
  if (isOpen) {
    // Відкладаємо оновлення стейту на наступний "тік", щоб уникнути синхронного каскаду
    const timer = setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setZones('');
      setNotes('');
      setPrice('');
    }, 0);

    return () => clearTimeout(timer); // Очищаємо таймер, якщо вікно раптом швидко закрили
  }
}, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Форматуємо дату з YYYY-MM-DD в DD.MM.YYYY
    const [year, month, day] = date.split('-');
    const formattedDate = `${day}.${month}.${year}`;

    onSave({
      date: formattedDate,
      zones: zones ? zones.split(',').map((s) => s.trim()) : [],
      notes,
      price: Number(price) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Записати візит в історію
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Дата візиту
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Зони (через кому)
            </label>
            <input
              type="text"
              placeholder="Наприклад: Глибоке бікіні, Пахви"
              value={zones}
              onChange={(e) => setZones(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Ціна (₴)
            </label>
            <input
              type="number"
              placeholder="Наприклад: 800"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Нотатки
            </label>
            <textarea
              placeholder="Особливості процедури, вростання тощо..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2 border border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-sm"
            >
              Зберегти візит
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
