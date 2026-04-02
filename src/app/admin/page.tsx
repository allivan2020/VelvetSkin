'use client';

import { useState } from 'react';
import LeadsTab from '@/components/admin/LeadsTab';
import ClientsTab from '@/components/admin/ClientsTab';
import ReviewsTab from '@/components/admin/ReviewsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'leads' | 'clients' | 'reviews'>(
    'leads',
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            CRM Velvet Skin
          </h1>
        </div>

        {/* Таби перемикання */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl w-fit shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'leads'
                ? 'bg-[#c49f2d] text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            🔥 Нові заявки (Квіз / Сайт)
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-[#c49f2d] text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            👥 База клієнтів
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-[#c49f2d] text-white shadow-lg'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            💬 Відгуки
          </button>
        </div>

        {/* Відображення вибраного компонента */}
        <div className="bg-white/50 p-1 rounded-3xl">
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'clients' && <ClientsTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
        </div>
      </div>
    </div>
  );
}
