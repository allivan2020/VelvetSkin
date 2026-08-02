import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { generateLeadSummary } from '@/lib/groq';
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

  let aiSummary = 'AI аналіз недоступний';
  try {
    if (experience || safeSelections.length > 0) {
      aiSummary =
        (await generateLeadSummary({
          experience,
          selections: safeSelections,
        })) || aiSummary;
    }
  } catch (e) {
    console.error('AI Summary generation failed:', e);
  }

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

  const message = `🔥 <b>НОВА ЗАЯВКА!</b>\n👤 <b>Ім'я:</b> ${escapeHtml(name)}\n📞 <b>Контакт:</b> ${escapeHtml(contact)}\n🏷 <b>Тип:</b> ${escapeHtml(leadType)}\n📊 <b>AI:</b> ${escapeHtml(aiSummary)}`;
  void notifyTelegram(message);

  return NextResponse.json({ success: true, id: savedLead._id });
}
