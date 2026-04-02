'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface Lead {
  _id: string;
  name: string;
  contact: string;
  experience: string;
  selections: string[];
  status: string;
  createdAt: string;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Завантажуємо ліди при відкритті вкладки
  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error('Помилка завантаження лідів:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Зміна статусу ліда
  const changeStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      // Оновлюємо локальний стейт, щоб не робити зайвий запит до БД
      setLeads(
        leads.map((lead) =>
          lead._id === id ? { ...lead, status: newStatus } : lead,
        ),
      );
    } catch (error) {
      alert('Помилка оновлення статусу');
    }
  };

  // Видалення ліда
  const deleteLead = async (id: string) => {
    if (!confirm('Точно видалити цю заявку?')) return;
    try {
      await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      setLeads(leads.filter((lead) => lead._id !== id));
    } catch (error) {
      alert('Помилка видалення');
    }
  };

  if (isLoading)
    return <div className="text-center py-10 opacity-60">Завантаження...</div>;
  if (leads.length === 0)
    return (
      <div className="text-center py-10 opacity-60">
        Поки що немає нових заявок
      </div>
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <div
          key={lead._id}
          className="bg-[#fcfaf8] border border-[#4a3f39]/10 rounded-2xl p-5 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-[16px] text-[#4a3f39]">
                {lead.name}
              </h3>
              <p className="font-poppins text-[13px] text-[#bd9b7d]">
                {lead.contact}
              </p>
            </div>
            {/* Бейджик статусу */}
            <span
              className={clsx(
                'px-2.5 py-1 text-[10px] uppercase tracking-[1px] font-medium rounded-md',
                lead.status === 'Новий'
                  ? 'bg-green-100 text-green-700'
                  : lead.status === 'В роботі'
                    ? 'bg-blue-100 text-blue-700'
                    : lead.status === 'Відмова'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-200 text-gray-700',
              )}
            >
              {lead.status}
            </span>
          </div>

          <div className="mb-4 text-[13px] opacity-80 flex-grow">
            <p>
              <strong>Клієнт:</strong> {lead.experience}
            </p>
            <p>
              <strong>Вибір:</strong>{' '}
              {lead.selections.length > 0 ? lead.selections.join(', ') : '-'}
            </p>
            <p className="text-[11px] opacity-60 mt-2">
              {new Date(lead.createdAt).toLocaleString('uk-UA')}
            </p>
          </div>

          {/* Кнопки дій */}
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-[#4a3f39]/10">
            {lead.status === 'Новий' && (
              <button
                onClick={() => changeStatus(lead._id, 'В роботі')}
                className="flex-1 py-2 bg-[#bd9b7d]/10 hover:bg-[#bd9b7d]/20 text-[#bd9b7d] rounded-lg text-[12px] font-medium transition-colors"
              >
                Взяти в роботу
              </button>
            )}
            {lead.status === 'В роботі' && (
              <button
                onClick={() => changeStatus(lead._id, 'Конвертовано')}
                className="flex-1 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg text-[12px] font-medium transition-colors"
              >
                Записати клієнта
              </button>
            )}
            <button
              onClick={() => deleteLead(lead._id)}
              className="px-3 py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-lg text-[12px] font-medium transition-colors"
            >
              Видалити
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
