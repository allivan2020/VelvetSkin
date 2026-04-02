import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const query = isAdmin ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const message = `<b>✨ Новий відгук!</b>\n\n<b>👤 Ім'я:</b> ${name}\n<b>💬 Текст:</b> ${text}`;
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }).catch((err) => console.error('TG Error:', err));
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Помилка при збереженні' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, isApproved } = await req.json();
    const updated = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка оновлення' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Видалено' });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
