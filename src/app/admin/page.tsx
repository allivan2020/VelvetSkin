'use client';

import { useEffect, useState } from 'react';

interface ReviewData {
  _id: string;
  name: string;
  text: string;
  date: string;
  isApproved: boolean;
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Перевірка пароля (проста логіка для початку)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальному проекті це робиться через API,
    // але для швидкості ми звіримо з екологічною змінною через "секретний" клієнтський хак
    // або просто пропишемо тут (пізніше винесемо в API для безпеки)
    if (
      password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      password === '1234'
    ) {
      setIsAuthorized(true);
      sessionStorage.setItem('isAdmin', 'true');
    } else {
      setError('Невірний пароль');
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error('Помилка завантаження', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
      setIsAuthorized(true);
    }
    fetchReviews();
  }, [isAuthorized]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved: !currentStatus }),
    });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Видалити назавжди?')) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    fetchReviews();
  };

  // Екран логіну
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-3xl shadow-xl border border-[#bd9b7d]/20 w-full max-w-sm text-center"
        >
          <h1 className="font-vibes text-4xl text-[#1a1614] mb-6">
            Вхід в систему
          </h1>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Пароль адміна"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-xl border border-[#bd9b7d]/30 focus:outline-none focus:border-[#bd9b7d] mb-4 text-center"
          />
          {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-[#917152] text-white rounded-xl font-poppins text-xs uppercase tracking-widest hover:bg-[#7a5e43] transition-all"
          >
            Увійти
          </button>
        </form>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center font-poppins text-[#917152]">
        Завантаження...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfbf7] py-20 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-center border-b border-[#bd9b7d]/20 pb-6">
          <h1 className="font-vibes text-5xl text-[#1a1614]">Адмін-панель</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('isAdmin');
              setIsAuthorized(false);
            }}
            className="text-[10px] uppercase tracking-widest text-[#917152] hover:text-[#1a1614]"
          >
            Вихід
          </button>
        </header>

        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`p-6 rounded-2xl border transition-all ${review.isApproved ? 'bg-white border-[#bd9b7d]/30 shadow-sm' : 'bg-[#1a1614]/5 border-transparent'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <h3 className="font-poppins text-sm uppercase tracking-widest font-bold text-[#1a1614]">
                      {review.name}
                    </h3>
                    <span className="text-xs text-[#bd9b7d]">
                      {review.date}
                    </span>
                  </div>
                  <p className="font-cormorant text-lg text-[#4a3f39] italic">
                    "{review.text}"
                  </p>
                </div>
                <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                  <button
                    onClick={() =>
                      toggleApproval(review._id, review.isApproved)
                    }
                    className={`px-4 py-2 rounded-lg font-poppins text-xs uppercase tracking-wider ${review.isApproved ? 'bg-gray-200 text-gray-600' : 'bg-[#917152] text-white'}`}
                  >
                    {review.isApproved ? 'Приховати' : 'Одобрити'}
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
                    className="px-4 py-2 rounded-lg font-poppins text-xs uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
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
