'use client';

import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import AddVisitModal from './AddVisitModal';
import NextAppointmentModal from './NextAppointmentModal';
import { formatSlotUk, slotKey } from '@/lib/appointments';

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
  nextAppointmentTime?: string;
  nextAppointmentService?: string;
  updatedAt: string;
}

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'upcoming'>('newest');
  const [search, setSearch] = useState('');

  // Стейт для модалок
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    clientId: string | null;
    clientName: string;
  }>({
    isOpen: false,
    clientId: null,
    clientName: '',
  });

  const [visitModal, setVisitModal] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  // 👈 Стейт для нової модалки запису
  const [appointmentModal, setAppointmentModal] = useState<{
    isOpen: boolean;
    client: Client | null;
  }>({
    isOpen: false,
    client: null,
  });

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Помилка:', err);
      toast.error('Помилка завантаження бази');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchClients();
    };
    loadData();
  }, [fetchClients]);

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        // Миттєво не перезапитуємо всю базу, UI вже оновлено (Optimistic UI)
        toast.success('Оновлено!');
      } else {
        throw new Error('Помилка');
      }
    } catch {
      toast.error('Помилка оновлення');
      fetchClients(); // Відкат у разі помилки
    }
  };

  const confirmDeleteClient = async () => {
    if (!deleteModal.clientId) return;
    try {
      const res = await fetch(`/api/clients?id=${deleteModal.clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Клієнта видалено');
        fetchClients();
      } else {
        throw new Error('Помилка');
      }
    } catch {
      toast.error('Помилка при видаленні');
    } finally {
      setDeleteModal({ isOpen: false, clientId: null, clientName: '' });
    }
  };

  const handleSaveVisit = (visitData: Visit) => {
    if (!visitModal.client) return;

    const updatedClients = clients.map((c) =>
      c._id === visitModal.client!._id
        ? { ...c, visits: [...c.visits, visitData] }
        : c,
    );
    setClients(updatedClients);

    updateClient(visitModal.client._id, {
      visits: [...visitModal.client.visits, visitData],
    });
  };

  const handleSaveAppointment = (date: string, time: string) => {
    if (!appointmentModal.client) return;
    const clientId = appointmentModal.client._id;

    setClients((prev) =>
      prev.map((c) =>
        c._id === clientId
          ? {
              ...c,
              nextAppointment: date,
              nextAppointmentTime: time,
            }
          : c,
      ),
    );

    updateClient(clientId, {
      nextAppointment: date,
      nextAppointmentTime: time,
    });

    setAppointmentModal({ isOpen: false, client: null });
  };

  const displayedClients = [...clients]
    .filter((client) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q) ||
        (client.telegram || '').toLowerCase().includes(q) ||
        (client.source || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'upcoming') {
        if (!a.nextAppointment) return 1;
        if (!b.nextAppointment) return -1;
        return slotKey(
          a.nextAppointment,
          a.nextAppointmentTime || '10:00',
        ).localeCompare(
          slotKey(b.nextAppointment, b.nextAppointmentTime || '10:00'),
        );
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const upcomingSoon = clients
    .filter((c) => c.nextAppointment)
    .sort((a, b) =>
      slotKey(a.nextAppointment, a.nextAppointmentTime || '10:00').localeCompare(
        slotKey(b.nextAppointment, b.nextAppointmentTime || '10:00'),
      ),
    )
    .slice(0, 5);

  if (loading)
    return (
      <div className="p-4 text-gray-500 animate-pulse">
        Завантаження бази...
      </div>
    );

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Видалення клієнта"
        message={`Ви точно хочете видалити клієнта ${deleteModal.clientName} та всю історію візитів назавжди?`}
        onCancel={() =>
          setDeleteModal({ isOpen: false, clientId: null, clientName: '' })
        }
        onConfirm={confirmDeleteClient}
      />

      <AddVisitModal
        isOpen={visitModal.isOpen}
        onClose={() => setVisitModal({ isOpen: false, client: null })}
        onSave={handleSaveVisit}
      />

      {/* 👈 Підключаємо нову модалку */}
      <NextAppointmentModal
        isOpen={appointmentModal.isOpen}
        client={appointmentModal.client}
        onClose={() => setAppointmentModal({ isOpen: false, client: null })}
        onSave={handleSaveAppointment}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">
            База клієнтів ({clients.length})
          </h2>

          <div className="bg-[#f3efe8] p-1 rounded-xl inline-flex text-sm">
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === 'newest' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Останні активні
            </button>
            <button
              type="button"
              onClick={() => setSortBy('upcoming')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${sortBy === 'upcoming' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Найближчі записи
            </button>
          </div>
        </div>

        <label className="block">
          <span className="sr-only">Пошук клієнта</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за імʼям, телефоном, Telegram..."
            className="w-full md:max-w-md px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#c49f2d] focus:ring-2 focus:ring-[#c49f2d]/15"
          />
        </label>

        {sortBy === 'upcoming' && upcomingSoon.length > 0 && !search && (
          <div className="rounded-2xl border border-[#e8dfd2] bg-[#fbf7f1] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#856142] mb-3">
              Найближчі
            </p>
            <ul className="space-y-2">
              {upcomingSoon.map((c) => (
                <li
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-[#856142] font-medium">
                    {formatSlotUk(c.nextAppointment, c.nextAppointmentTime)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {displayedClients.length === 0 ? (
        <p className="text-gray-500 italic">
          {search
            ? 'Нікого не знайдено за цим запитом.'
            : 'База клієнтів поки порожня.'}
        </p>
      ) : (
        <div className="grid gap-4">
          {displayedClients.map((client) => (
            <div
              key={client._id}
              className="p-5 border rounded-2xl bg-white shadow-sm border-gray-100 relative"
            >
              <button
                onClick={() =>
                  setDeleteModal({
                    isOpen: true,
                    clientId: client._id,
                    clientName: client.name,
                  })
                }
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
                  {/* 👈 Змінили onClick: тепер він відкриває нашу модалку */}
                  <button
                    onClick={() =>
                      setAppointmentModal({ isOpen: true, client })
                    }
                    className={`text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 ${
                      client.nextAppointment
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                        : 'bg-white text-gray-500 hover:bg-gray-50 border border-dashed border-gray-300'
                    }`}
                  >
                    {client.nextAppointment
                      ? `🗓 ${formatSlotUk(client.nextAppointment, client.nextAppointmentTime)}`
                      : '🗓 Запланувати візит'}
                  </button>
                </div>
              </div>

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
                    Історія процедур ({client.visits?.length || 0}):
                  </h4>
                  <button
                    onClick={() => setVisitModal({ isOpen: true, client })}
                    className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>+</span> Записати візит
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
                            {new Intl.NumberFormat('uk-UA', {
                              style: 'currency',
                              currency: 'UAH',
                              maximumFractionDigits: 0,
                            }).format(visit.price)}
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
