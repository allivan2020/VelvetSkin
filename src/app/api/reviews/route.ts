import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review'; // Убедись, что модель существует!

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin');

    // Если запрос из админки, отдаем все отзывы. Иначе - только одобренные.
    const query = isAdmin ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Помилка завантаження відгуків' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    // Добавили source
    const { name, text, source } = body;

    const newReview = await Review.create({
      name: name || 'Анонім',
      text,
      source: source || 'Сайт', // Сохраняем источник
      isApproved: false,
    });

    // Відправка сповіщення в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      // Добавили джерело в повідомлення
      const message = `<b>💬 Новий відгук!</b>\n\n<b>👤 Від:</b> ${newReview.name}\n<b>📱 Джерело:</b> ${newReview.source}\n<b>📝 Текст:</b> ${newReview.text}\n\n<i>⏳ Відгук очікує на модерацію.</i>`;

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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Помилка створення відгуку' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, isApproved } = body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );

    return NextResponse.json(updatedReview);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка оновлення' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Видалено' });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
