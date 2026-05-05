'use client';

import { useState } from 'react';

interface Client {
  _id: string;
  name: string;
  nextAppointment?: string;
}

interface NextAppointmentModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (date: string) => void;
}

export default function NextAppointmentModal({
  isOpen,
  client,
  onClose,
  onSave,
}: NextAppointmentModalProps) {
  const [date, setDate] = useState('');

  // Створюємо стан, щоб запам'ятати, для якого клієнта ми востаннє встановлювали дату
  const [prevClientId, setPrevClientId] = useState<string | null>(null);

  // Визначаємо активного клієнта: якщо модалка відкрита, беремо його ID, інакше null
  const activeClientId = isOpen && client ? client._id : null;

  // Якщо активний клієнт змінився (модалка відкрилась або перемкнулась на іншого)
  // Ми оновлюємо стан прямо під час рендеру, що запобігає каскадним перемальовуванням
  if (activeClientId !== prevClientId) {
    setPrevClientId(activeClientId);
    setDate(client?.nextAppointment || '');
  }

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(date);
  };

  const handleClear = () => {
    onSave(''); // Передаємо порожній рядок, щоб видалити запис
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-[#231d19]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-gray-900">Наступний візит</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Оберіть дату для клієнта{' '}
            <span className="font-bold text-gray-900">{client.name}</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all cursor-pointer font-medium text-gray-800"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-amber-200"
              >
                Зберегти дату
              </button>

              {client.nextAppointment && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  Скасувати візит (Очистити)
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
