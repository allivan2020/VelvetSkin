'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LeadsTab from '@/components/admin/LeadsTab';
import ClientsTab from '@/components/admin/ClientsTab';
import ReviewsTab from '@/components/admin/ReviewsTab';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'reviews'>(
    'leads',
  );
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const tabs = [
    { id: 'leads' as const, label: 'Нові заявки' },
    { id: 'clients' as const, label: 'Клієнти' },
    { id: 'reviews' as const, label: 'Відгуки' },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ee] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#856142] font-semibold mb-1">
              VelvetSkin
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#1a1614]">
              CRM
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-sm font-semibold text-[#856142] hover:text-[#1a1614] px-4 py-2.5 rounded-xl border border-[#e4d9cb] bg-white disabled:opacity-60 transition"
          >
            {loggingOut ? 'Вихід...' : 'Вийти'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-[#efe6da]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#c49f2d] text-white shadow-md'
                  : 'text-gray-500 hover:bg-[#f7f3ee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white/60 p-1 rounded-3xl border border-[#efe6da]/80">
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
        </div>
      </div>
    </div>
  );
}
