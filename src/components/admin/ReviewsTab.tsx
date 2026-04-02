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

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?admin=true');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Помилка завантаження:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleApprove = async (id: string, currentStatus: boolean) => {
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved: !currentStatus }),
    });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Видалити цей відгук?')) return;
    await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  if (loading) return <p className="p-4">Завантаження відгуків...</p>;

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-bold mb-4">Керування відгуками</h2>
      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <p>Відгуків ще немає</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className={`p-4 border rounded-lg ${!review.isApproved ? 'bg-yellow-50' : 'bg-green-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-gray-600">{review.text}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleApprove(review._id, review.isApproved)}
                    className={`px-3 py-1 rounded text-white text-sm ${review.isApproved ? 'bg-orange-400' : 'bg-green-500'}`}
                  >
                    {review.isApproved ? 'Приховати' : 'Схвалити'}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
