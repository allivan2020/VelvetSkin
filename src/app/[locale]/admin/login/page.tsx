'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Невірний пароль');
      }

      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка входу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-gray-100 shadow-sm rounded-2xl p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">
            VelvetSkin Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Введіть пароль для доступу до CRM
          </p>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Пароль
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#c49f2d] focus:ring-2 focus:ring-[#c49f2d]/20"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#c49f2d] text-white font-bold py-2.5 text-sm hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>
    </div>
  );
}
