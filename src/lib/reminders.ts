import connectToDatabase from '@/lib/mongodb';
import Client from '@/models/Client';
import {
  addDaysToDateStr,
  formatSlotUk,
  localTodayStr,
  slotKey,
} from '@/lib/appointments';
import { escapeHtml, notifyTelegram } from '@/lib/api-helpers';
import {
  formatBusyNoteLine,
  listUpcomingBusyBlocks,
} from '@/lib/busy-calendar';

export type ReminderItem = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  label: string;
};

export type RemindersPayload = {
  today: ReminderItem[];
  tomorrow: ReminderItem[];
  todayDate: string;
  tomorrowDate: string;
};

export async function loadReminders(): Promise<RemindersPayload> {
  await connectToDatabase();
  const today = localTodayStr();
  const tomorrow = addDaysToDateStr(today, 1);

  const clients = await Client.find({
    nextAppointment: { $in: [today, tomorrow] },
  })
    .select(
      'name phone nextAppointment nextAppointmentTime nextAppointmentService',
    )
    .lean();

  const sorted = [...clients].sort((a, b) =>
    slotKey(
      String(a.nextAppointment),
      (a.nextAppointmentTime as string) || '10:00',
    ).localeCompare(
      slotKey(
        String(b.nextAppointment),
        (b.nextAppointmentTime as string) || '10:00',
      ),
    ),
  );

  const mapItem = (c: (typeof clients)[number]): ReminderItem => ({
    id: String(c._id),
    name: c.name as string,
    phone: (c.phone as string) || '',
    date: String(c.nextAppointment),
    time: (c.nextAppointmentTime as string) || '10:00',
    service: (c.nextAppointmentService as string) || '',
    label: formatSlotUk(
      String(c.nextAppointment),
      (c.nextAppointmentTime as string) || '10:00',
    ),
  });

  return {
    today: sorted.filter((c) => c.nextAppointment === today).map(mapItem),
    tomorrow: sorted
      .filter((c) => c.nextAppointment === tomorrow)
      .map(mapItem),
    todayDate: today,
    tomorrowDate: tomorrow,
  };
}

export function formatMasterDigestHtml(data: RemindersPayload): string {
  const lines = [
    `⏰ <b>Нагадування майстру</b>`,
    `Сьогодні (${escapeHtml(data.todayDate)}):`,
  ];

  if (data.today.length === 0) {
    lines.push('— немає записів');
  } else {
    for (const s of data.today) {
      lines.push(
        `• ${escapeHtml(s.time)} — ${escapeHtml(s.name)}${
          s.service ? ` (${escapeHtml(s.service)})` : ''
        }`,
      );
    }
  }

  lines.push(``, `Завтра (${escapeHtml(data.tomorrowDate)}):`);
  if (data.tomorrow.length === 0) {
    lines.push('— немає записів');
  } else {
    for (const s of data.tomorrow) {
      lines.push(
        `• ${escapeHtml(s.time)} — ${escapeHtml(s.name)}${
          s.service ? ` (${escapeHtml(s.service)})` : ''
        }`,
      );
    }
  }

  return lines.join('\n');
}

export async function sendMasterDigestTelegram(): Promise<
  | { ok: true; data: RemindersPayload }
  | { ok: false; reason: string; data?: RemindersPayload }
> {
  const data = await loadReminders();
  let html = formatMasterDigestHtml(data);

  try {
    const notes = await listUpcomingBusyBlocks(15);
    const near = notes.filter((n) => {
      const d = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Kyiv',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(n.startAt));
      return d === data.todayDate || d === data.tomorrowDate;
    });
    if (near.length > 0) {
      html += `\n\n📝 <b>Нотатки з iPhone:</b>`;
      for (const n of near.slice(0, 8)) {
        html += `\n• ${escapeHtml(formatBusyNoteLine(n))}`;
      }
    }
  } catch (e) {
    console.error('Digest phone notes failed:', e);
  }

  const tg = await notifyTelegram(html);
  if (!tg.ok) {
    return { ok: false, reason: tg.reason, data };
  }
  return { ok: true, data };
}
