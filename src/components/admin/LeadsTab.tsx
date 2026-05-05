'use client';

import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import { format } from 'date-fns';

interface Lead {
  _id: string;
  name: string;
  contact: string;
  phone?: string;
  experience: string;
  selections: string[] | string;
  type?: string;
  status: string;
  createdAt: string;
  aiSummary?: string;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'delete' | null;
    lead: Lead | null;
  }>({ isOpen: false, type: null, lead: null });

  const formatServices = (selections: string[] | string): string => {
    if (Array.isArray(selections)) {
      return selections.join(', ') || 'Не вказано';
    }
    return selections || 'Не вказано';
  };

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch {
      toast.error('Помилка завантаження лідів');
    } finally {
      setLoading(false);
    }
  }, []);

  // ИСПРАВЛЕННЫЙ ЭФФЕКТ: используем асинхронную обертку, чтобы избежать синхронного setState
  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      if (isMounted) {
        await fetchLeads();
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchLeads]);

  const handleAccept = async () => {
    const lead = actionModal.lead;
    if (!lead) return;

    setLeads((prev) => prev.filter((l) => l._id !== lead._id));

    try {
      const serviceStr = formatServices(lead.selections);
      const phoneStr = lead.contact || lead.phone || 'Не вказано';

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

      if (!res.ok) throw new Error('Помилка сервера');

      await fetch(`/api/admin/leads?id=${lead._id}`, { method: 'DELETE' });

      const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(`Запис: ${lead.name}`)}&details=${encodeURIComponent(`Тел: ${phoneStr}\nПослуга: ${serviceStr}`)}`;
      window.open(calendarUrl, '_blank');

      toast.success('Заявку успішно прийнято!');
    } catch {
      toast.error('Сталася помилка');
      fetchLeads();
    } finally {
      setActionModal({ isOpen: false, type: null, lead: null });
    }
  };

  const handleDelete = async () => {
    const lead = actionModal.lead;
    if (!lead) return;

    setLeads((prev) => prev.filter((l) => l._id !== lead._id));

    try {
      const res = await fetch(`/api/admin/leads?id=${lead._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Видалено');
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Помилка');
      fetchLeads();
    } finally {
      setActionModal({ isOpen: false, type: null, lead: null });
    }
  };

  if (loading)
    return (
      <div className="p-10 text-gray-400 text-center animate-pulse font-medium">
        Завантаження нових заявок...
      </div>
    );

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      <ConfirmModal
        isOpen={actionModal.isOpen}
        title={
          actionModal.type === 'accept' ? 'Прийняти заявку' : 'Видалити заявку'
        }
        message={
          actionModal.type === 'accept'
            ? `Прийняти від ${actionModal.lead?.name}?`
            : `Видалити ${actionModal.lead?.name}?`
        }
        confirmText={
          actionModal.type === 'accept' ? 'Так, прийняти' : 'Так, видалити'
        }
        isDanger={actionModal.type === 'delete'}
        onCancel={() =>
          setActionModal({ isOpen: false, type: null, lead: null })
        }
        onConfirm={actionModal.type === 'accept' ? handleAccept : handleDelete}
      />

      <h2 className="text-xl font-bold text-gray-800">Нові заявки</h2>

      {leads.length === 0 ? (
        <p className="text-gray-500 italic py-10 text-center">
          Наразі нових заявок немає.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <div
              key={lead._id}
              className="p-5 border rounded-2xl bg-white shadow-sm border-gray-100 flex flex-col justify-between hover:border-blue-200 transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {lead.name}
                    </h3>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase font-bold mt-1 inline-block border border-blue-100">
                      {lead.type || 'Новий лід'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {lead.createdAt
                      ? format(new Date(lead.createdAt), 'dd.MM.yyyy, HH:mm')
                      : ''}
                  </span>
                </div>

                <div className="mb-4 space-y-1.5">
                  <p className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="opacity-50 text-xs">📞</span>
                    <span className="font-semibold text-gray-900">
                      {lead.contact || lead.phone}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="opacity-50 text-xs mt-0.5">🛠</span>
                    <span>
                      Послуга:{' '}
                      <span className="font-medium text-gray-900">
                        {formatServices(lead.selections)}
                      </span>
                    </span>
                  </p>
                  {lead.experience && lead.experience !== 'Не вказано' && (
                    <p className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="opacity-50 text-xs">🗓</span>
                      <span>
                        Досвід:{' '}
                        <span className="font-medium text-gray-900">
                          {lead.experience}
                        </span>
                      </span>
                    </p>
                  )}
                </div>

                {/* БЛОК ІІ-Аналітики */}
                {lead.aiSummary && (
                  <div className="mt-4 mb-5 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm">🪄</span>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-800/80">
                        AI Рекомендація
                      </h4>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed italic font-medium">
                      {lead.aiSummary}
                    </p>
                    <div className="absolute -right-1 -bottom-1 text-2xl opacity-5 group-hover:scale-110 transition-transform duration-500">
                      ✨
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-50 mt-auto">
                <button
                  onClick={() =>
                    setActionModal({ isOpen: true, type: 'accept', lead })
                  }
                  className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition-all active:scale-95 shadow-sm shadow-green-200"
                >
                  Прийняти
                </button>
                <button
                  onClick={() =>
                    setActionModal({ isOpen: true, type: 'delete', lead })
                  }
                  className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
                >
                  Відхилити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
