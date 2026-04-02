'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
// Импортируем компоненты вкладок
import ReviewsTab from '@/components/admin/ReviewsTab';
import LeadsTab from '@/components/admin/LeadsTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('leads');

  const tabs = [
    { id: 'leads', label: '🔥 Нові Ліди (Квіз)' },
    { id: 'clients', label: '👥 База Клієнтів' },
    { id: 'reviews', label: '💬 Відгуки' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf8] p-6 md:p-12 font-poppins text-[#4a3f39]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="font-cormorant text-4xl md:text-5xl mb-2">
            CRM Velvet Skin
          </h1>
          <p className="text-sm opacity-70">
            Керування заявками, клієнтами та розкладом
          </p>
        </header>

        {/* Навигация */}
        <div className="flex flex-wrap gap-2 border-b border-[#bd9b7d]/30 mb-8 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'px-6 py-2.5 rounded-full text-[13px] uppercase tracking-[1px] font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-[#bd9b7d] text-white shadow-md'
                  : 'bg-transparent text-[#4a3f39] hover:bg-[#bd9b7d]/10',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Контент вкладок */}
        <main className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#4a3f39]/5 min-h-[500px]">
          {/* ВКЛАДКА ЛИДОВ */}
          {activeTab === 'leads' && (
            <div>
              <h2 className="text-2xl font-cormorant mb-6">
                Нові заявки (Квіз)
              </h2>
              <LeadsTab />
            </div>
          )}

          {/* ВКЛАДКА КЛИЕНТОВ (Пока пустая) */}
          {activeTab === 'clients' && (
            <div>
              <h2 className="text-2xl font-cormorant mb-4">База клієнтів</h2>
              <p className="text-sm opacity-70 italic">
                Тут буде список постійних клієнтів та Google Календар.
              </p>
            </div>
          )}

          {/* ВКЛАДКА ОТЗЫВОВ */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-cormorant mb-6">
                Модерація відгуків
              </h2>
              {/* <ReviewsTab /> */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
