'use client';

import { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // ДОДАНО
import ConfirmModal from './ConfirmModal'; // Шлях до твого компонента

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

  // ДОДАНО: Стан для модалки видалення
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    reviewId: string | null;
  }>({
    isOpen: false,
    reviewId: null,
  });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) throw new Error('Помилка сервера');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Помилка завантаження відгуків:', err);
      toast.error('Не вдалося завантажити відгуки'); // ДОДАНО
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const loadData = async () => {
    await fetchReviews();
  };
  loadData();
}, [fetchReviews]);

  const toggleApprove = async (id: string, currentStatus: boolean) => {
    // Optimistic UI: одразу змінюємо стан локально для швидкості
    setReviews((prev) =>
      prev.map((r) =>
        r._id === id ? { ...r, isApproved: !currentStatus } : r,
      ),
    );

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });

      if (res.ok) {
        toast.success(currentStatus ? 'Відгук приховано' : 'Відгук схвалено'); // ДОДАНО
      } else {
        throw new Error('Помилка');
      }
    } catch {
      toast.error('Не вдалося змінити статус'); // ДОДАНО
      fetchReviews(); // Відкочуємо зміни, якщо сталася помилка
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.reviewId) return;

    const id = deleteModal.reviewId;
    // Оптимістичне видалення з UI
    setReviews((prev) => prev.filter((r) => r._id !== id));

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Відгук назавжди видалено');
      } else {
        throw new Error('Помилка');
      }
    } catch {
      toast.error('Помилка видалення');
      fetchReviews(); // Відкочуємо, якщо помилка
    }
  };

  if (loading)
    return (
      <div className="p-4 text-gray-500 animate-pulse">Завантаження...</div>
    );

  return (
    <div className="space-y-4">
      {/* ДОДАНО: Компонент для відображення тостів */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* ДОДАНО: Наша нова модалка */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Видалення відгуку"
        message="Ви впевнені, що хочете видалити цей відгук? Цю дію неможливо скасувати."
        onCancel={() => setDeleteModal({ isOpen: false, reviewId: null })}
        onConfirm={confirmDelete}
      />

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
                    // ЗМІНЕНО: Замість confirm() відкриваємо модалку
                    onClick={() =>
                      setDeleteModal({ isOpen: true, reviewId: review._id })
                    }
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
