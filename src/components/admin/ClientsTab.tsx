'use client';

import { useState, useEffect } from 'react';

interface Visit {
  date: string;
  zones: string[];
  notes: string;
  price: number;
}

interface Client {
  _id: string;
  name: string;
  phone: string;
  telegram: string;
  source: string;
  visits: Visit[];
  generalNotes: string;
  nextAppointment: string;
  updatedAt: string;
}

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'upcoming'>('newest');

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Помилка:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchClients();
    };
    loadData();
  }, []);

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) fetchClients();
    } catch {
      alert('Помилка оновлення');
    }
  };

  // НОВА ФУНКЦІЯ: ВИДАЛЕННЯ КЛІЄНТА
  const deleteClient = async (id: string, name: string) => {
    if (
      !confirm(
        `Ви точно хочете видалити клієнта ${name} та всю історію його візитів назавжди?`,
      )
    )
      return;
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchClients();
    } catch  {
      alert('Помилка при видаленні');
    }
  };

  const addVisit = (client: Client) => {
    const date = prompt(
      'Дата виконаного візиту (наприклад: 15.04.2026):',
      new Date().toLocaleDateString('uk-UA'),
    );
    if (!date) return;
    const zonesStr = prompt('Що робили? (наприклад: Глибоке бікіні, Пахви):');
    const notes = prompt(
      'Нотатки по процедурі (наприклад: було вростання, або просто ОК):',
    );
    const priceStr = prompt(
      'Скільки заплатили? (тільки цифри, наприклад: 800):',
    );

    const newVisit = {
      date,
      zones: zonesStr ? zonesStr.split(',').map((s) => s.trim()) : [],
      notes: notes || '',
      price: Number(priceStr) || 0,
    };

    updateClient(client._id, { visits: [...client.visits, newVisit] });
  };

  const setNextAppointment = (client: Client) => {
    const date = prompt(
      'Дата НАСТУПНОГО сеансу (щоб не забути нагадати клієнту):',
      client.nextAppointment,
    );
    if (date !== null) {
      updateClient(client._id, { nextAppointment: date });
    }
  };

  // Логіка сортування
  const displayedClients = [...clients].sort((a, b) => {
    if (sortBy === 'upcoming') {
      if (!a.nextAppointment) return 1;
      if (!b.nextAppointment) return -1;
      return a.nextAppointment.localeCompare(b.nextAppointment);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (loading)
    return <div className="p-4 text-gray-500">Завантаження бази...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          База клієнтів ({clients.length})
        </h2>

        <div className="bg-gray-100 p-1 rounded-xl inline-flex text-sm">
          <button
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === 'newest' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Останні активні
          </button>
          <button
            onClick={() => setSortBy('upcoming')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === 'upcoming' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Найближчі записи
          </button>
        </div>
      </div>

      {displayedClients.length === 0 ? (
        <p className="text-gray-500 italic">База клієнтів поки порожня.</p>
      ) : (
        <div className="grid gap-4">
          {displayedClients.map((client) => (
            <div
              key={client._id}
              className="p-5 border rounded-2xl bg-white shadow-sm border-gray-100 relative"
            >
              {/* Кнопка Видалення (Кошик) в правому верхньому куті */}
              <button
                onClick={() => deleteClient(client._id, client.name)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="Видалити клієнта"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5 v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                  <path
                    fillRule="evenodd"
                    d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                  />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-gray-50 pb-4 pr-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {client.name}
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      {client.source}
                    </span>
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    📞 {client.phone}
                  </p>
                </div>
                <div className="md:text-right shrink-0">
                  {/* Кнопка "Наступний візит" (Майбутнє) */}
                  <button
                    onClick={() => setNextAppointment(client)}
                    className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                      client.nextAppointment
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-dashed border-gray-300'
                    }`}
                  >
                    {client.nextAppointment
                      ? `🗓 Заплановано на: ${client.nextAppointment}`
                      : '🗓 Запланувати наступний візит'}
                  </button>
                </div>
              </div>

              {/* НОВЕ: ПОЛЕ ДЛЯ ЗАМІТОК */}
              <div className="mb-5 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <h4 className="font-bold text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  📝 Замітки про клієнта (автозбереження)
                </h4>
                <textarea
                  className="w-full p-2 text-sm bg-white border border-gray-200 focus:border-purple-300 rounded-lg transition-all outline-none resize-y"
                  placeholder="Особливості шкіри, алергії, побажання..."
                  rows={2}
                  defaultValue={client.generalNotes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== (client.generalNotes || '')) {
                      updateClient(client._id, {
                        generalNotes: e.target.value,
                      });
                    }
                  }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-gray-700">
                    Історія виконаних процедур ({client.visits?.length || 0}):
                  </h4>
                  {/* Кнопка "Додати візит" (Минуле/Історія) */}
                  <button
                    onClick={() => addVisit(client)}
                    className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all flex items-center gap-1"
                  >
                    <span>+</span> Записати в історію
                  </button>
                </div>

                {!client.visits || client.visits.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Немає записів про візити
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {client.visits.map((visit, idx) => (
                      <li
                        key={idx}
                        className="text-sm bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                      >
                        <span className="font-bold text-gray-800 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm">
                          {visit.date}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {visit.zones?.join(', ') || 'Зони не вказані'}
                        </span>
                        {visit.notes && (
                          <span className="text-gray-500 text-xs italic flex-1 md:text-center px-2">
                            {visit.notes}
                          </span>
                        )}
                        {visit.price > 0 && (
                          <span className="font-bold text-green-700 whitespace-nowrap bg-green-50 px-2 py-1 rounded ml-auto">
                            {visit.price} ₴
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
