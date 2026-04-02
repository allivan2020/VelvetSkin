'use client';

import { useState, useEffect } from 'react';

// --- ОПИС ТИПІВ (щоб не було any) ---
interface Lead {
  _id: string;
  name: string;
  contact: string;
  status: string;
  createdAt: string;
}

interface Review {
  _id: string;
  name: string;
  text: string;
  isApproved: boolean;
  date: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'reviews'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Функція завантаження всього одразу
  const loadData = async () => {
    setLoading(true);
    try {
      // Додаємо timestamp (?t=...), щоб Vercel не видавав старий кеш
      const t = Date.now();
      const [leadsRes, reviewsRes] = await Promise.all([
        fetch(`/api/admin/leads?t=${t}`),
        fetch(`/api/reviews?admin=true&t=${t}`),
      ]);

      const leadsData = await leadsRes.json();
      const reviewsData = await reviewsRes.json();

      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      console.error('Помилка завантаження:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Керування відгуками (Схвалити/Видалити)
  const handleReviewAction = async (
    id: string,
    action: 'approve' | 'delete',
    currentStatus?: boolean,
  ) => {
    const url = action === 'approve' ? '/api/reviews' : `/api/reviews?id=${id}`;
    const method = action === 'approve' ? 'PATCH' : 'DELETE';
    const body =
      action === 'approve'
        ? JSON.stringify({ id, isApproved: !currentStatus })
        : null;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    loadData();
  };

  if (loading)
    return <div className="p-10 text-center font-bold">Оновлення даних...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight">
            Панель керування
          </h1>
          <button
            onClick={loadData}
            className="text-xs bg-gray-200 px-3 py-1 rounded-full"
          >
            Оновити базу
          </button>
        </div>

        {/* Таби */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-[#c49f2d] text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            Ліди ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-[#c49f2d] text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            Відгуки ({reviews.length})
          </button>
        </div>

        {/* Контент */}
        <div className="space-y-4">
          {activeTab === 'leads'
            ? leads.map((lead) => (
                <div
                  key={lead._id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-gray-900">{lead.name}</div>
                    <div className="text-gray-500 text-sm">{lead.contact}</div>
                  </div>
                  <div className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold uppercase">
                    {lead.status}
                  </div>
                </div>
              ))
            : reviews.map((review) => (
                <div
                  key={review._id}
                  className={`p-5 rounded-2xl border transition-all ${review.isApproved ? 'bg-white border-gray-100' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {review.name}
                        {!review.isApproved && (
                          <span className="bg-amber-200 text-amber-800 text-[9px] px-2 py-0.5 rounded-md uppercase">
                            Новий
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {review.text}
                      </p>
                      <div className="text-[10px] text-gray-400 mt-2">
                        {review.date}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleReviewAction(
                            review._id,
                            'approve',
                            review.isApproved,
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${review.isApproved ? 'bg-gray-400' : 'bg-green-600'}`}
                      >
                        {review.isApproved ? 'Приховати' : 'Схвалити'}
                      </button>
                      <button
                        onClick={() => handleReviewAction(review._id, 'delete')}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
