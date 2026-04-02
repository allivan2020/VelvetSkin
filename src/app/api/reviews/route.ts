import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Если админ — отдаем всё, если нет — только одобренные
    const query = isAdmin ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при отриманні' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, text } = await req.json();
    if (!name || !text) {
      return NextResponse.json(
        { error: "Ім'я та текст обов'язкові" },
        { status: 400 },
      );
    }

    await dbConnect();
    const newReview = await Review.create({ name, text, isApproved: false });

    // Уведомление в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const siteUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'https://www.velvetskinzp.com';

    if (botToken && chatId) {
      const message = `<b>✨ Новий відгук!</b>\n\n<b>👤 Ім'я:</b> ${name}\n<b>💬 Текст:</b> ${text}\n\n<a href="${siteUrl}/admin">👉 В адмінку</a>`;
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

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при збереженні' },
      { status: 500 },
    );
  }
}

// Метод для одобрения отзыва
export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, isApproved } = await req.json();
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );
    return NextResponse.json(updatedReview);
  } catch (error) {
    return NextResponse.json({ error: 'Помилка оновлення' }, { status: 500 });
  }
}

// Метод для удаления
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Видалено' });
  } catch (error) {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
