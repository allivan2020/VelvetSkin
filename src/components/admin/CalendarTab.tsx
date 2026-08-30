'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import QRCode from 'qrcode';
import { formatSlotUk, localTodayStr, weekDates } from '@/lib/appointments';

interface ClientSlot {
  _id: string;
  name: string;
  phone: string;
  nextAppointment: string;
  nextAppointmentTime?: string;
  nextAppointmentService?: string;
}

function todayStr(): string {
  return localTodayStr();
}

function shiftWeek(anchor: string, deltaWeeks: number): string {
  const [y, m, d] = anchor.split('-').map(Number);
  const date = new Date(y, m - 1, d + deltaWeeks * 7);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

const WEEKDAY_UK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

interface ReminderItem {
  id: string;
  name: string;
  time: string;
  label: string;
  service?: string;
}

interface RemindersPayload {
  today: ReminderItem[];
  tomorrow: ReminderItem[];
  todayDate: string;
  tomorrowDate: string;
}

export default function CalendarTab() {
  const [clients, setClients] = useState<ClientSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchor, setAnchor] = useState(todayStr);
  const [feedUrl, setFeedUrl] = useState('');
  const [webcalUrl, setWebcalUrl] = useState('');
  const [feedConfigured, setFeedConfigured] = useState(false);
  const [feedLocalOnly, setFeedLocalOnly] = useState(false);
  const [reminders, setReminders] = useState<RemindersPayload | null>(null);
  const [sendingDigest, setSendingDigest] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [personalUrl, setPersonalUrl] = useState('');
  const [personalMasked, setPersonalMasked] = useState('');
  const [personalConfigured, setPersonalConfigured] = useState(false);
  const [personalSyncedAt, setPersonalSyncedAt] = useState<string | null>(null);
  const [personalError, setPersonalError] = useState('');
  const [personalNotes, setPersonalNotes] = useState<
    { id: string; line: string }[]
  >([]);
  const [personalBusy, setPersonalBusy] = useState(false);

  const days = useMemo(() => weekDates(anchor), [anchor]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as ClientSlot[];
      setClients(data.filter((c) => c.nextAppointment));
    } catch {
      toast.error('Не вдалося завантажити записи');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeedSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/calendar-settings');
      if (!res.ok) return;
      const data = await res.json();
      setFeedConfigured(Boolean(data.configured));
      setFeedUrl(data.httpsUrl || '');
      setWebcalUrl(data.webcalUrl || '');
      setFeedLocalOnly(Boolean(data.localOnly));
    } catch {
      /* ignore */
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/reminders');
      if (!res.ok) return;
      setReminders(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  const fetchPersonalCalendar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/personal-calendar');
      if (!res.ok) return;
      const data = await res.json();
      setPersonalConfigured(Boolean(data.configured));
      setPersonalMasked(data.urlMasked || '');
      setPersonalSyncedAt(data.syncedAt || null);
      setPersonalError(data.lastError || '');
      setPersonalNotes(
        Array.isArray(data.notes)
          ? data.notes.map((n: { id: string; line: string }) => ({
              id: n.id,
              line: n.line,
            }))
          : [],
      );
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchFeedSettings();
    fetchReminders();
    fetchPersonalCalendar();
  }, [fetchClients, fetchFeedSettings, fetchReminders, fetchPersonalCalendar]);

  useEffect(() => {
    const target = webcalUrl || feedUrl;
    if (!target) {
      setQrDataUrl('');
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(target, {
      width: 180,
      margin: 1,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [webcalUrl, feedUrl]);

  const sendDigest = async () => {
    setSendingDigest(true);
    try {
      const res = await fetch('/api/admin/reminders', { method: 'POST' });
      if (!res.ok) throw new Error();
      toast.success('Нагадування надіслано в Telegram (майстру)');
    } catch {
      toast.error('Не вдалося надіслати в Telegram');
    } finally {
      setSendingDigest(false);
    }
  };

  const savePersonalUrl = async () => {
    setPersonalBusy(true);
    try {
      const res = await fetch('/api/admin/personal-calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalIcsUrl: personalUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Не вдалося зберегти / синхронізувати');
      } else {
        toast.success(
          data.count != null
            ? `Збережено, нотаток: ${data.count}`
            : 'Збережено',
        );
        setPersonalUrl('');
      }
      await fetchPersonalCalendar();
    } catch {
      toast.error('Помилка збереження');
    } finally {
      setPersonalBusy(false);
    }
  };

  const syncPersonalNow = async () => {
    setPersonalBusy(true);
    try {
      const res = await fetch('/api/admin/personal-calendar', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fail');
      toast.success(`Синхронізовано: ${data.count} подій`);
      await fetchPersonalCalendar();
    } catch {
      toast.error('Синхронізація не вдалася');
      await fetchPersonalCalendar();
    } finally {
      setPersonalBusy(false);
    }
  };

  const byDay = useMemo(() => {
    const map = new Map<string, ClientSlot[]>();
    for (const day of days) map.set(day, []);
    for (const c of clients) {
      const list = map.get(c.nextAppointment);
      if (list) list.push(c);
    }
    for (const list of map.values()) {
      list.sort((a, b) =>
        (a.nextAppointmentTime || '10:00').localeCompare(
          b.nextAppointmentTime || '10:00',
        ),
      );
    }
    return map;
  }, [clients, days]);

  if (loading) {
    return (
      <div className="p-10 text-gray-400 text-center animate-pulse font-medium">
        Завантаження календаря...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Календар записів</h2>
          <p className="text-sm text-gray-500 mt-1">
            Робочі слоти з CRM (без особистого календаря телефону).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftWeek(a, -1))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setAnchor(todayStr())}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50"
          >
            Сьогодні
          </button>
          <button
            type="button"
            onClick={() => setAnchor((a) => shiftWeek(a, 1))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      {reminders && (
        <div className="rounded-2xl border border-[#e8dfd2] bg-white p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#856142]">
              Нагадування майстру
            </p>
            <button
              type="button"
              disabled={sendingDigest}
              onClick={() => void sendDigest()}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-[#fbf7f1] text-xs font-bold text-[#856142] hover:bg-[#f7f3ee] disabled:opacity-50"
            >
              {sendingDigest ? 'Надсилаю...' : 'Надіслати в Telegram'}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-bold text-gray-800 mb-1">
                Сьогодні ({reminders.todayDate})
              </p>
              {reminders.today.length === 0 ? (
                <p className="text-gray-400 italic text-xs">Немає записів</p>
              ) : (
                <ul className="space-y-1">
                  {reminders.today.map((s) => (
                    <li key={s.id} className="text-gray-700">
                      <span className="font-semibold text-[#856142]">
                        {s.time}
                      </span>{' '}
                      — {s.name}
                      {s.service ? (
                        <span className="text-gray-400"> · {s.service}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">
                Завтра ({reminders.tomorrowDate})
              </p>
              {reminders.tomorrow.length === 0 ? (
                <p className="text-gray-400 italic text-xs">Немає записів</p>
              ) : (
                <ul className="space-y-1">
                  {reminders.tomorrow.map((s) => (
                    <li key={s.id} className="text-gray-700">
                      <span className="font-semibold text-[#856142]">
                        {s.time}
                      </span>{' '}
                      — {s.name}
                      {s.service ? (
                        <span className="text-gray-400"> · {s.service}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#e8dfd2] bg-white p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[#856142]">
          Нотатки з iPhone
        </p>
        <p className="text-sm text-gray-700">
          Напишіть у Календарі iPhone замітки на датах. Підключіть секретний
          iCal URL (лише iCloud / Google / Outlook) — агент зчитує їх і пропонує
          варіанти в Telegram. У ваш особистий календар CRM нічого не записує.
        </p>
        {personalConfigured ? (
          <p className="text-xs text-gray-500">
            Підключено: <span className="font-mono">{personalMasked}</span>
            {personalSyncedAt
              ? ` · синхр. ${new Date(personalSyncedAt).toLocaleString('uk-UA')}`
              : ''}
          </p>
        ) : (
          <p className="text-xs text-amber-800">
            Ще не підключено. iCloud / Google / Outlook → поділитися календарем →
            секретна адреса iCal (https/webcal).
          </p>
        )}
        {personalError ? (
          <p className="text-xs text-red-600">Помилка: {personalError}</p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="password"
            autoComplete="off"
            value={personalUrl}
            onChange={(e) => setPersonalUrl(e.target.value)}
            placeholder="webcal:// або https://… (iCal)"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c49f2d]"
          />
          <button
            type="button"
            disabled={personalBusy || !personalUrl.trim()}
            onClick={() => void savePersonalUrl()}
            className="px-4 py-2.5 rounded-xl bg-[#1a1614] text-white text-sm font-bold disabled:opacity-40"
          >
            Зберегти
          </button>
          <button
            type="button"
            disabled={personalBusy || !personalConfigured}
            onClick={() => void syncPersonalNow()}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-40"
          >
            Синхронізувати
          </button>
        </div>
        {personalNotes.length > 0 ? (
          <ul className="space-y-1.5 text-sm max-h-48 overflow-y-auto">
            {personalNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl bg-[#f7f3ee] border border-[#efe6da] px-3 py-2 text-gray-800"
              >
                {n.line}
              </li>
            ))}
          </ul>
        ) : personalConfigured ? (
          <p className="text-xs text-gray-400 italic">
            Поки немає подій у найближчі дні (або натисніть Синхронізувати).
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#e8dfd2] bg-[#fbf7f1] p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[#856142]">
          Календар на iPhone
        </p>
        {feedConfigured && (webcalUrl || feedUrl) ? (
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 space-y-3">
              <p className="text-sm text-gray-700">
                Один раз натисніть кнопку <span className="font-semibold">на iPhone</span> —
                записи з CRM зʼявлятимуться в Календарі самі. Копіювати нічого не треба.
              </p>
              {feedLocalOnly ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Зараз локальний режим: підписка йде на{' '}
                  <span className="font-mono">localhost</span> (поки крутиться{' '}
                  <span className="font-mono">next dev</span>). На iPhone з мережі це не
                  спрацює — потрібен деплой на velvetskinzp.com +{' '}
                  <span className="font-mono">CALENDAR_FEED_TOKEN</span> у Vercel.
                </p>
              ) : null}
              <a
                href={webcalUrl || feedUrl}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#c49f2d] text-white text-sm font-bold hover:bg-[#b08f28]"
              >
                Додати в Календар iPhone
              </a>
              <p className="text-[11px] text-gray-500">
                Якщо дивитеся з компʼютера — відскануйте QR iPhone камерою.
                {feedLocalOnly
                  ? ' На цьому Mac можна відкрити кнопку вище (Календар.app), поки dev-сервер запущений.'
                  : ''}
              </p>
            </div>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="QR для підписки календаря"
                width={180}
                height={180}
                className="rounded-xl border border-[#e4d9cb] bg-white p-2 shrink-0"
              />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-amber-800">
            Додайте <code className="font-mono text-xs">CALENDAR_FEED_TOKEN</code>{' '}
            у середовище (довгий випадковий рядок) і перезапустіть деплой.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day, i) => {
          const slots = byDay.get(day) || [];
          const isToday = day === todayStr();
          return (
            <div
              key={day}
              className={`rounded-2xl border p-3 min-h-[140px] ${
                isToday
                  ? 'border-[#c49f2d] bg-[#fffbf0]'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-bold uppercase text-gray-500">
                  {WEEKDAY_UK[i]}
                </span>
                <span
                  className={`text-sm font-bold ${isToday ? 'text-[#c49f2d]' : 'text-gray-800'}`}
                >
                  {day.slice(8)}
                </span>
              </div>
              {slots.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Вільно</p>
              ) : (
                <ul className="space-y-2">
                  {slots.map((s) => (
                    <li
                      key={s._id}
                      className="rounded-xl bg-[#f7f3ee] border border-[#efe6da] p-2"
                    >
                      <p className="text-xs font-bold text-[#856142]">
                        {s.nextAppointmentTime || '10:00'}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {s.name}
                      </p>
                      {s.nextAppointmentService && (
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {s.nextAppointmentService}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-2">Усі активні записи</h3>
        {clients.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Немає запланованих візитів.</p>
        ) : (
          <ul className="space-y-2">
            {[...clients]
              .sort((a, b) =>
                `${a.nextAppointment}T${a.nextAppointmentTime || '10:00'}`.localeCompare(
                  `${b.nextAppointment}T${b.nextAppointmentTime || '10:00'}`,
                ),
              )
              .map((c) => (
                <li
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm border border-gray-100 rounded-xl bg-white px-4 py-3"
                >
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-[#856142]">
                    {formatSlotUk(c.nextAppointment, c.nextAppointmentTime)}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
