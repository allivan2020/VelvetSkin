'use client';

import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  name: string;
  text: string;
  isApproved: boolean;
  createdAt: string;
}

export default function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Функція завантаження - шлях ТОЧНО як ти перевіряв у браузері
  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?admin=true');
      if (!res.ok) throw new Error('Помилка сервера');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Помилка завантаження відгуків:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      alert('Не вдалося змінити статус');
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Видалити цей відгук назавжди?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews();
    } catch (err) {
      alert('Помилка видалення');
    }
  };

  if (loading) return <div className="p-4 text-gray-500">Завантаження...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Керування відгуками</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500 italic">Відгуків поки немає.</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`p-5 rounded-2xl border transition-all ${
                review.isApproved
                  ? 'bg-white border-gray-100'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">
                      {review.name}
                    </span>
                    {!review.isApproved && (
                      <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full uppercase font-bold">
                        Очікує
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleApprove(review._id, review.isApproved)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      review.isApproved
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    }`}
                  >
                    {review.isApproved ? 'Приховати' : 'Схвалити'}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
