'use client';

import { useState, useEffect } from 'react';

interface Lead {
  _id: string;
  name: string;
  contact: string;
  experience: string;
  selections: string[] | string;
  type?: string;
  status: string;
  createdAt: string;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Помилка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const acceptLead = async (lead: Lead) => {
    if (!confirm(`Прийняти заявку від ${lead.name} та перейти до Календаря?`))
      return;

    // Відкриваємо вкладку заздалегідь
    const calendarWindow = window.open('', '_blank');

    try {
      let serviceStr = 'Не вказано';
      if (Array.isArray(lead.selections)) {
        serviceStr = lead.selections.join(', ');
      } else if (typeof lead.selections === 'string') {
        serviceStr = lead.selections;
      }

      const phoneStr = lead.contact || (lead as any).phone || 'Не вказано';

      // 1. Відправляємо на сервер (він сам або створить, або оновить історію)
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name,
          phone: phoneStr,
          source: lead.type || 'Сайт',
          service: serviceStr,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        if (calendarWindow) calendarWindow.close();
        alert(`Помилка сервера: ${responseData.error}`);
        return;
      }

      // 2. Видаляємо ліда зі списку нових
      await fetch(`/api/admin/leads?id=${lead._id}`, { method: 'DELETE' });

      // 3. Формуємо файл для РІДНОГО календаря смартфона (.ics)
      const now = new Date();
      now.setHours(now.getHours() + 1); // Ставимо час просто як заглушку
      const dtStart =
        now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      now.setHours(now.getHours() + 1); // Тривалість процедури - умовно 1 година
      const dtEnd = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      // Формуємо вміст файлу. Формат вимагає перенесення рядків \r\n
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Запис: ${lead.name}
DESCRIPTION:Телефон: ${phoneStr}\\nПослуга: ${serviceStr}
DTSTART:${dtStart}
DTEND:${dtEnd}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');

      // Перетворюємо текст на файл
      const blob = new Blob([icsContent], {
        type: 'text/calendar;charset=utf-8',
      });
      const icsUrl = URL.createObjectURL(blob);

      // Передаємо файл у підготовлену вкладку
      if (calendarWindow) {
        calendarWindow.location.href = icsUrl;
      }

      // 4. Оновлюємо список
      fetchLeads();
    } catch (error: any) {
      if (calendarWindow) calendarWindow.close();
      console.error('Критична помилка:', error);
      alert(`Помилка: ${error.message}`);
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Точно видалити цю заявку назавжди?')) return;
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchLeads();
    } catch (err) {
      alert('Помилка видалення');
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Завантаження...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Нові заявки</h2>

      {leads.length === 0 ? (
        <p className="text-gray-500 italic">Наразі нових заявок немає.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {leads.map((lead) => {
            let displayService = 'Не вказано';
            if (Array.isArray(lead.selections)) {
              displayService = lead.selections.join(', ') || 'Не вказано';
            } else if (typeof lead.selections === 'string') {
              displayService = lead.selections;
            }

            return (
              <div
                key={lead._id}
                className="p-5 border rounded-2xl bg-white shadow-sm border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {lead.name}
                      </h3>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase font-bold mt-1 inline-block">
                        {lead.type || 'Новий лід'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleDateString('uk-UA')
                        : ''}
                    </span>
                  </div>

                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-gray-700">
                      📞{' '}
                      <span className="font-medium">
                        {lead.contact || (lead as any).phone}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      🛠 Послуга:{' '}
                      <span className="font-medium">{displayService}</span>
                    </p>
                    {lead.experience && lead.experience !== 'Не вказано' && (
                      <p className="text-sm text-gray-700">
                        🗓 Досвід:{' '}
                        <span className="font-medium">{lead.experience}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-50 mt-auto">
                  <button
                    onClick={() => acceptLead(lead)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all shadow-sm"
                  >
                    Прийняти
                  </button>
                  <button
                    onClick={() => deleteLead(lead._id)}
                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
                  >
                    Відхилити
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
