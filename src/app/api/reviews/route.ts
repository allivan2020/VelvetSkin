import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import {
  errorResponse,
  escapeHtml,
  getClientIp,
  notifyTelegram,
  rateLimit,
} from '@/lib/api-helpers';
import { getApprovedReviews } from '@/lib/reviews';
import { createReviewSchema } from '@/lib/validation';

export async function GET() {
  try {
    const reviews = await getApprovedReviews();
    return NextResponse.json(reviews);
  } catch (e) {
    return errorResponse('Помилка завантаження відгуків', 500, e);
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limited = rateLimit(`reviews:${ip}`, 5, 60_000);
    if (!limited.ok) {
      return errorResponse('Забагато запитів. Спробуйте пізніше.', 429);
    }

    await connectToDatabase();
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірні дані відгуку', 400);
    }

    const { name, text, source } = parsed.data;

    const newReview = await Review.create({
      name: name || 'Анонім',
      text,
      source: source || 'Сайт',
      isApproved: false,
    });

    const message = `<b>💬 Новий відгук!</b>\n\n<b>👤 Від:</b> ${escapeHtml(newReview.name)}\n<b>📱 Джерело:</b> ${escapeHtml(newReview.source)}\n<b>📝 Текст:</b> ${escapeHtml(newReview.text)}\n\n<i>⏳ Відгук очікує на модерацію.</i>`;
    void notifyTelegram(message);

    return NextResponse.json(newReview, { status: 201 });
  } catch (e) {
    return errorResponse('Помилка створення відгуку', 500, e);
  }
}
