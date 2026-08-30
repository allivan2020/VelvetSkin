import Groq from 'groq-sdk';
import connectToDatabase from '@/lib/mongodb';
import Client from '@/models/Client';
import Lead from '@/models/Lead';
import Review from '@/models/Review';
import {
  formatSlotUk,
  isValidDateStr,
  isValidTimeStr,
  localTodayStr,
  slotKey,
  slotsOverlap,
  suggestFreeWindows,
} from '@/lib/appointments';
import { escapeHtml, notifyTelegram } from '@/lib/api-helpers';
import {
  busyBlocksToOccupied,
  formatBusyNoteLine,
  listUpcomingBusyBlocks,
} from '@/lib/busy-calendar';
import { getGroqModel } from '@/lib/groq-model';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***${digits.slice(-4)}`;
}

/** Strip URLs and trim untrusted CRM text before LLM / Telegram. */
function sanitizeUntrustedText(value: unknown, max = 160): string {
  return String(value ?? '')
    .replace(/https?:\/\/\S+/gi, '[посилання]')
    .replace(/www\.\S+/gi, '[посилання]')
    .replace(/t\.me\/\S+/gi, '[посилання]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export type AgentHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type ProposedAction =
  | {
      type: 'set_appointment';
      clientId: string;
      clientName: string;
      date: string;
      time: string;
      service?: string;
    }
  | {
      type: 'clear_appointment';
      clientId: string;
      clientName: string;
    };

export type AgentResult = {
  reply: string;
  proposal?: ProposedAction;
};

type LeanClient = {
  _id: unknown;
  name: string;
  phone: string;
  nextAppointment?: string;
  nextAppointmentTime?: string;
  nextAppointmentService?: string;
  generalNotes?: string;
};

async function buildCrmSnapshot(): Promise<{
  text: string;
  clients: LeanClient[];
}> {
  await connectToDatabase();

  const [leads, booked, allClients, pendingReviews] = await Promise.all([
    Lead.find({
      $or: [
        { status: { $in: ['Новий', 'В роботі'] } },
        { status: { $exists: false } },
        { status: null },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .select('name contact status type selections createdAt')
      .lean(),
    Client.find({ nextAppointment: { $exists: true, $nin: [null, ''] } })
      .select(
        'name phone nextAppointment nextAppointmentTime nextAppointmentService generalNotes',
      )
      .lean(),
    Client.find({})
      .select(
        'name phone nextAppointment nextAppointmentTime nextAppointmentService generalNotes',
      )
      .limit(80)
      .lean(),
    Review.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name text createdAt')
      .lean(),
  ]);

  const upcoming = [...booked].sort((a, b) =>
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

  const phoneNotes = await listUpcomingBusyBlocks(30);

  const free = suggestFreeWindows([
    ...booked.map((c) => ({
      clientId: String(c._id),
      date: String(c.nextAppointment),
      time: (c.nextAppointmentTime as string) || '10:00',
    })),
    ...busyBlocksToOccupied(phoneNotes),
  ]);

  const todayKey = localTodayStr();

  const lines: string[] = [
    `Сьогодні (Europe/Kyiv): ${todayKey}`,
    `Нових заявок: ${leads.length}`,
    `Запланованих візитів: ${upcoming.length}`,
    `Відгуків на модерації: ${pendingReviews.length}`,
    `Нотаток з iPhone: ${phoneNotes.length}`,
    '',
    '=== Нотатки з iPhone (адмін писав у календарі) ===',
  ];

  if (phoneNotes.length === 0) {
    lines.push('(немає — підключіть ICS у вкладці Календар)');
  } else {
    for (const n of phoneNotes.slice(0, 20)) {
      lines.push(`- ${sanitizeUntrustedText(formatBusyNoteLine(n), 200)}`);
    }
  }

  lines.push(
    '',
    '=== Вільні орієнтири (CRM + iPhone зайнятість) ===',
    free.length
      ? free.map((w) => `${w.date} ${w.time}`).join(', ')
      : '(немає у найближчі дні)',
    '',
    '=== Клієнти (для запису — id; телефон маскований) ===',
  );

  for (const c of allClients.slice(0, 40)) {
    lines.push(
      `- id=${String(c._id)} | ${sanitizeUntrustedText(c.name, 80)} | ${maskPhone(c.phone || '')}${
        c.nextAppointment
          ? ` | запис ${c.nextAppointment} ${c.nextAppointmentTime || '10:00'}`
          : ''
      }`,
    );
  }

  lines.push('', '=== Найближчі записи (до 12) ===');
  for (const c of upcoming.slice(0, 12)) {
    lines.push(
      `- ${formatSlotUk(String(c.nextAppointment), (c.nextAppointmentTime as string) || '10:00')}: ${sanitizeUntrustedText(c.name, 80)}, тел ${maskPhone(String(c.phone || ''))}${
        c.nextAppointmentService
          ? `, ${sanitizeUntrustedText(c.nextAppointmentService, 80)}`
          : ''
      }`,
    );
  }
  if (upcoming.length === 0) lines.push('(немає)');

  lines.push('', '=== Нові заявки (до 10) ===');
  for (const l of leads.slice(0, 10)) {
    const sel = Array.isArray(l.selections)
      ? l.selections.map((s: string) => sanitizeUntrustedText(s, 40)).join(', ')
      : sanitizeUntrustedText(l.selections, 80);
    lines.push(
      `- ${sanitizeUntrustedText(l.name, 60)} / ${maskPhone(String(l.contact || ''))} / ${sanitizeUntrustedText(l.type || 'лід', 40)} / ${sel}`,
    );
  }
  if (leads.length === 0) lines.push('(немає)');

  lines.push('', '=== Відгуки на модерації ===');
  for (const r of pendingReviews.slice(0, 5)) {
    lines.push(
      `- ${sanitizeUntrustedText(r.name || 'Анонім', 40)}: ${sanitizeUntrustedText(r.text, 100)}`,
    );
  }
  if (pendingReviews.length === 0) lines.push('(немає)');

  return { text: lines.join('\n'), clients: allClients as LeanClient[] };
}

function fallbackReply(message: string, snapshot: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('запис') ||
    lower.includes('календар') ||
    lower.includes('сьогодні') ||
    lower.includes('завтра')
  ) {
    return (
      'Ось зріз CRM (без AI — додайте GROQ_API_KEY для повних відповідей):\n\n' +
      snapshot.slice(0, 1800)
    );
  }
  return (
    'Я асистент CRM VelvetSkin. Можу підказати по записах і запропонувати слот — збереження лише після вашої кнопки «Підтвердити». Клієнтам ніколи не пишу.\n\n' +
    'Короткий зріз:\n' +
    snapshot.split('\n').slice(0, 8).join('\n')
  );
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

function findClient(
  clients: LeanClient[],
  query: string,
): LeanClient | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const digits = normalizePhone(query);

  if (digits.length >= 6) {
    const byPhone = clients.find((c) =>
      normalizePhone(c.phone || '').includes(digits),
    );
    if (byPhone) return byPhone;
  }

  const exact = clients.find((c) => c.name.toLowerCase() === q);
  if (exact) return exact;

  const partial = clients.filter((c) => c.name.toLowerCase().includes(q));
  if (partial.length === 1) return partial[0];
  return null;
}

async function findOverlap(
  date: string,
  time: string,
  excludeClientId?: string,
): Promise<string | null> {
  const booked = await Client.find({
    nextAppointment: { $exists: true, $nin: [null, ''] },
  })
    .select('name nextAppointment nextAppointmentTime')
    .lean();

  for (const c of booked) {
    if (excludeClientId && String(c._id) === excludeClientId) continue;
    if (
      slotsOverlap(
        { date, time },
        {
          date: String(c.nextAppointment),
          time: (c.nextAppointmentTime as string) || '10:00',
        },
      )
    ) {
      return `${c.name} (${c.nextAppointment} ${c.nextAppointmentTime || '10:00'})`;
    }
  }

  const phoneNotes = await listUpcomingBusyBlocks(80);
  const occupied = busyBlocksToOccupied(phoneNotes);
  for (const o of occupied) {
    if (
      slotsOverlap(
        { date, time, durationMinutes: 60 },
        {
          date: o.date,
          time: o.time,
          durationMinutes: o.durationMinutes ?? 60,
        },
      )
    ) {
      return `особистий календар (${o.date} ${o.time})`;
    }
  }

  return null;
}

const AGENT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'notify_master_telegram',
      description:
        'Надіслати майстру повідомлення в Telegram САЛОНУ (той самий чат, що й нові заявки). Без підтвердження. НІКОЛИ не для клієнта.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description:
              'Текст українською. Можна простий HTML: <b>, <i>. Нагадування, підказки, вільні слоти.',
          },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'propose_set_appointment',
      description:
        'Запропонувати майстру зберегти запис (дата+час) для існуючого клієнта. НЕ зберігає само — лише пропозиція на підтвердження.',
      parameters: {
        type: 'object',
        properties: {
          client_query: {
            type: 'string',
            description: 'Імʼя або телефон клієнта з CRM',
          },
          date: { type: 'string', description: 'yyyy-MM-dd' },
          time: { type: 'string', description: 'HH:mm' },
          service: { type: 'string', description: 'Короткий опис послуги' },
        },
        required: ['client_query', 'date', 'time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'propose_clear_appointment',
      description:
        'Запропонувати скасувати наступний запис клієнта (потрібне підтвердження майстра).',
      parameters: {
        type: 'object',
        properties: {
          client_query: {
            type: 'string',
            description: 'Імʼя або телефон клієнта з CRM',
          },
        },
        required: ['client_query'],
      },
    },
  },
];

async function handleNotifyMaster(argsJson: string): Promise<AgentResult> {
  let text = '';
  try {
    const args = JSON.parse(argsJson) as { text?: string };
    text = String(args.text || '').trim();
  } catch {
    return { reply: 'Не вдалося розібрати текст для Telegram.' };
  }

  if (!text) {
    return { reply: 'Порожнє повідомлення — у Telegram нічого не надіслано.' };
  }

  const plain = sanitizeUntrustedText(text.replace(/<[^>]+>/g, ''), 1200);
  if (!plain) {
    return {
      reply:
        'Повідомлення відхилено (порожнє після очищення посилань). Перефразуйте без URL.',
    };
  }

  const message = `🤖 <b>Асистент CRM</b>\n${escapeHtml(plain)}`;

  const tg = await notifyTelegram(message);
  if (!tg.ok) {
    return {
      reply: `Не вдалося надіслати в Telegram (${tg.reason}). Текст був:\n${plain.slice(0, 500)}`,
    };
  }

  return {
    reply: `Надіслано в Telegram (майстру):\n${plain.slice(0, 800)}`,
  };
}

async function proposalFromToolCall(
  name: string,
  argsJson: string,
  clients: LeanClient[],
): Promise<{ proposal?: ProposedAction; error?: string }> {
  let args: Record<string, string> = {};
  try {
    args = JSON.parse(argsJson) as Record<string, string>;
  } catch {
    return { error: 'Невірні аргументи інструменту' };
  }

  const client = findClient(clients, args.client_query || '');
  if (!client) {
    return {
      error: `Клієнта «${args.client_query || ''}» не знайдено в CRM. Спочатку додайте через Прийняти заявку або картку клієнта.`,
    };
  }

  if (name === 'propose_clear_appointment') {
    return {
      proposal: {
        type: 'clear_appointment',
        clientId: String(client._id),
        clientName: client.name,
      },
    };
  }

  if (name === 'propose_set_appointment') {
    const date = args.date?.trim() || '';
    const time = args.time?.trim() || '';
    if (!isValidDateStr(date) || !isValidTimeStr(time)) {
      return { error: 'Дата/час мають бути у форматі yyyy-MM-dd і HH:mm' };
    }
    const overlap = await findOverlap(date, time, String(client._id));
    if (overlap) {
      return {
        error: `Перетин зі слотом: ${overlap}. Запропонуйте інший час.`,
      };
    }
    return {
      proposal: {
        type: 'set_appointment',
        clientId: String(client._id),
        clientName: client.name,
        date,
        time,
        service: args.service?.trim() || undefined,
      },
    };
  }

  return { error: 'Невідомий інструмент' };
}

export async function confirmAgentAction(
  action: ProposedAction,
): Promise<AgentResult> {
  await connectToDatabase();

  if (action.type === 'clear_appointment') {
    const updated = await Client.findByIdAndUpdate(
      action.clientId,
      {
        nextAppointment: '',
        nextAppointmentTime: '',
        nextAppointmentService: '',
      },
      { new: true },
    );
    if (!updated) {
      return { reply: 'Клієнта не знайдено — нічого не змінено.' };
    }
    return {
      reply: `Скасовано запис для ${updated.name}. Календар (ICS) оновиться при наступній синхронізації.`,
    };
  }

  const overlap = await findOverlap(
    action.date,
    action.time,
    action.clientId,
  );
  if (overlap) {
    return {
      reply: `Не збережено: перетин зі слотом ${overlap}.`,
    };
  }

  const updated = await Client.findByIdAndUpdate(
    action.clientId,
    {
      nextAppointment: action.date,
      nextAppointmentTime: action.time,
      ...(action.service !== undefined && {
        nextAppointmentService: action.service,
      }),
    },
    { new: true },
  );

  if (!updated) {
    return { reply: 'Клієнта не знайдено — нічого не змінено.' };
  }

  return {
    reply: `Збережено: ${updated.name} — ${formatSlotUk(action.date, action.time)}. Запис зʼявиться в CRM і в ICS-підписці.`,
  };
}

export async function runAdminAgent(
  message: string,
  history: AgentHistoryItem[] = [],
): Promise<AgentResult> {
  const { text: snapshot, clients } = await buildCrmSnapshot();

  if (!process.env.GROQ_API_KEY) {
    return { reply: fallbackReply(message, snapshot) };
  }

  try {
    const truncatedHistory = history.slice(-8).map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content.slice(0, 2000),
    }));

    const response = await groq.chat.completions.create({
      model: getGroqModel(),
      temperature: 0.3,
      max_tokens: 700,
      tools: AGENT_TOOLS,
      tool_choice: 'auto',
      messages: [
        {
          role: 'system',
          content: `Ти — бізнес-асистент салону VelvetSkin у внутрішній CRM (/admin).
Мова: українська, коротко і по суті.
ЖОРСТКЕ ПРАВИЛО: НІКОЛИ не надсилаєш повідомлення КЛІЄНТАМ і не претендуєш, що відправив їм.
Майстру в Telegram салону: для нагадувань і підказок одразу викликай notify_master_telegram — БЕЗ підтвердження. Не включай зовнішні URL у текст.
Опирайся на «Нотатки з iPhone» і вільні орієнтири: якщо адмін написав у календарі обмеження/підказки — врахуй їх у пропозиціях.
Запис у календар CRM: propose_set_appointment / propose_clear_appointment — збереження ЛИШЕ після кнопки «Підтвердити».
Не вигадуй клієнтів — лише з CRM-контексту.
Можеш відповідати текстом без інструментів, якщо питання інформаційне.

CRM-контекст:
${snapshot}`,
        },
        ...truncatedHistory,
        { role: 'user', content: message },
      ],
    });

    const choice = response.choices[0]?.message;
    const toolCalls = choice?.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      // Prefer telegram notify if present; otherwise first tool
      const notifyCall = toolCalls.find(
        (c) => c.function?.name === 'notify_master_telegram',
      );
      const call = notifyCall || toolCalls[0];
      const fnName = call.function?.name || '';
      const fnArgs = call.function?.arguments || '{}';

      if (fnName === 'notify_master_telegram') {
        return handleNotifyMaster(fnArgs);
      }

      const built = await proposalFromToolCall(fnName, fnArgs, clients);

      if (built.error) {
        return { reply: built.error };
      }

      if (built.proposal?.type === 'set_appointment') {
        const p = built.proposal;
        return {
          reply: `Пропозиція запису:\n${p.clientName} — ${formatSlotUk(p.date, p.time)}${
            p.service ? `\nПослуга: ${p.service}` : ''
          }\n\nНатисніть «Підтвердити», щоб зберегти в CRM і календар.`,
          proposal: p,
        };
      }

      if (built.proposal?.type === 'clear_appointment') {
        const p = built.proposal;
        return {
          reply: `Пропозиція скасувати запис для ${p.clientName}.\n\nНатисніть «Підтвердити», щоб очистити слот.`,
          proposal: p,
        };
      }
    }

    const reply =
      choice?.content?.trim() || fallbackReply(message, snapshot);

    return { reply };
  } catch (e) {
    console.error('Admin agent error:', e);
    return { reply: fallbackReply(message, snapshot) };
  }
}
