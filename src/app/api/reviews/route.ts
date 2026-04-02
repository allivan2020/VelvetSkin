import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const query = isAdmin ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, text } = await req.json();

    const newReview = await Review.create({ name, text, isApproved: false });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const message =
        `<b>✨ Новий відгук!</b>\n\n` +
        `<b>👤 Ім'я:</b> ${name}\n` +
        `<b>💬 Текст:</b> ${text}`;

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
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, isApproved } = await req.json();
    const updated = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Ok' });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
