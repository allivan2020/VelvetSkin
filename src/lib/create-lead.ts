import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Client from '@/models/Client';
import { generateLeadSummary } from '@/lib/groq';
import {
  draftClientReplyUk,
  suggestFreeWindows,
} from '@/lib/appointments';
import {
  busyBlocksToOccupied,
  listUpcomingBusyBlocks,
} from '@/lib/busy-calendar';
import {
  errorResponse,
  escapeHtml,
  getClientIp,
  notifyTelegram,
  rateLimit,
  verifyTurnstile,
} from '@/lib/api-helpers';
import { createLeadSchema } from '@/lib/validation';
import { NextResponse } from 'next/server';

const AI_SUMMARY_TIMEOUT_MS = 3_000;

function buildFallbackSummary(
  experience: string | undefined,
  selections: string[],
): string {
  const exp = experience || 'не вказано';
  const options = selections.length ? selections.join(', ') : 'не вказані';
  return `Увага майстру: клієнт - досвід: "${exp}". Побажання: ${options}.`;
}

async function generateLeadSummaryWithTimeout(
  experience: string | undefined,
  selections: string[],
): Promise<string> {
  const fallback = buildFallbackSummary(experience, selections);

  if (!experience && selections.length === 0) {
    return fallback;
  }

  try {
    const summary = await Promise.race([
      generateLeadSummary({ experience, selections }),
      new Promise<string>((resolve) =>
        setTimeout(() => resolve(fallback), AI_SUMMARY_TIMEOUT_MS),
      ),
    ]);
    return summary?.trim() || fallback;
  } catch (e) {
    console.error('AI Summary generation failed:', e);
    return fallback;
  }
}

async function loadFreeWindows() {
  const booked = await Client.find({
    nextAppointment: { $exists: true, $nin: [null, ''] },
  })
    .select('nextAppointment nextAppointmentTime')
    .lean();

  let phoneOccupied: ReturnType<typeof busyBlocksToOccupied> = [];
  try {
    const notes = await listUpcomingBusyBlocks(80);
    phoneOccupied = busyBlocksToOccupied(notes);
  } catch (e) {
    console.error('Busy blocks for free windows failed:', e);
  }

  return suggestFreeWindows([
    ...booked.map((c) => ({
      clientId: String(c._id),
      date: String(c.nextAppointment),
      time: (c.nextAppointmentTime as string) || '10:00',
    })),
    ...phoneOccupied,
  ]);
}

/** Shared public lead creation — used by /api/leads and legacy /api/admin/leads POST. */
export async function createPublicLead(req: Request) {
  const ip = getClientIp(req);
  const limited = rateLimit(`leads:${ip}`, 3, 60_000);
  if (!limited.ok) {
    return errorResponse('Забагато запитів. Спробуйте пізніше.', 429);
  }

  const body = await req.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('Невірні дані заявки', 400);
  }

  const { name, contact, experience, selections, type, captcha } = parsed.data;
  const leadType = type?.trim() || 'Квіз';

  const captchaResult = await verifyTurnstile(captcha);
  if (!captchaResult.ok) {
    return errorResponse(captchaResult.error, 403);
  }

  await connectToDatabase();

  const safeSelections = selections ?? [];
  const aiSummary = await generateLeadSummaryWithTimeout(
    experience,
    safeSelections,
  );

  const newLead = new Lead({
    name,
    contact,
    experience: experience || 'Не вказано',
    selections: safeSelections,
    aiSummary,
    type: leadType,
    status: 'Новий',
    createdAt: new Date(),
  });

  const savedLead = await newLead.save();

  const selectionsText = safeSelections.length
    ? escapeHtml(safeSelections.join(', '))
    : '—';

  let freeWindows: { date: string; time: string }[] = [];
  try {
    freeWindows = await loadFreeWindows();
  } catch (e) {
    console.error('Free windows lookup failed:', e);
  }

  const freeText = freeWindows.length
    ? freeWindows.map((w) => `${w.date} ${w.time}`).join(', ')
    : 'немає вільних орієнтирів на найближчі дні';

  const draft = draftClientReplyUk({ name, freeWindows });

  const leadNotice = [
    `🔥 <b>НОВА ЗАЯВКА!</b>`,
    `👤 <b>Ім'я:</b> ${escapeHtml(name)}`,
    `📞 <b>Контакт:</b> ${escapeHtml(contact)}`,
    `🏷 <b>Тип:</b> ${escapeHtml(leadType)}`,
    `✨ <b>Досвід:</b> ${escapeHtml(experience || 'Не вказано')}`,
    `📝 <b>Побажання:</b> ${selectionsText}`,
  ].join('\n');

  const agentFollowUp = [
    `🤖 <b>Асистент CRM</b>`,
    `📊 <b>Порада:</b> ${escapeHtml(aiSummary)}`,
    ``,
    `🗓 <b>Вільні орієнтири:</b> ${escapeHtml(freeText)}`,
    `👉 <b>Наступна дія:</b> /admin → Заявки → Прийняти (обрати дату/час)`,
    ``,
    `📋 <b>Чернетка клієнту</b> (скопіюй сам, бот не надсилає):`,
    escapeHtml(draft),
  ].join('\n');

  // Must await on Vercel — void fire-and-forget is dropped when the isolate freezes.
  const tgLead = await notifyTelegram(leadNotice);
  if (!tgLead.ok) {
    console.error(
      `[Telegram] Lead ${String(savedLead._id)} saved but lead notify failed:`,
      tgLead.reason,
    );
  }

  const tgAgent = await notifyTelegram(agentFollowUp);
  if (!tgAgent.ok) {
    console.error(
      `[Telegram] Lead ${String(savedLead._id)} agent follow-up failed:`,
      tgAgent.reason,
    );
  }

  return NextResponse.json({ success: true, id: savedLead._id });
}
