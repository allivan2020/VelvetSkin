import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

// GET-запрос: получаем только одобренные отзывы
export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ isApproved: true }).sort({
      createdAt: -1,
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при отриманні відгуків' },
      { status: 500 },
    );
  }
}

// POST-запрос: сохраняем отзыв и отправляем уведомление
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, text } = body;

    if (!name || !text) {
      return NextResponse.json(
        { error: "Ім'я та текст обов'язкові" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const newReview = new Review({ name, text });
    await newReview.save();

    // --- НАСТРОЙКИ TELEGRAM ---
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Динамическая ссылка: берется из Vercel или ставится запасная
    const siteUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://www.velvetskinzp.com';
    const adminLink = `${siteUrl.replace(/\/$/, '')}/admin`;

    if (botToken && chatId) {
      // Используем HTML разметку (как в твоем первом файле с заявками) — она надежнее
      const message =
        `<b>✨ Новий відгук на сайті!</b>\n\n` +
        `<b>👤 Ім'я:</b> ${name}\n` +
        `<b>💬 Текст:</b> ${text}\n\n` +
        `<a href="${adminLink}">👉 Перейти в адмінку</a>`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json(
      { message: 'Відгук успішно додано' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Review Error:', error);
    return NextResponse.json(
      { error: 'Помилка при збереженні' },
      { status: 500 },
    );
  }
}
