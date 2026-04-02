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
    const { name, text } = body;

    const newReview = await Review.create({
      name: name || 'Анонім',
      text,
      isApproved: false, // По умолчанию отзывы не одобрены
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка створення' }, { status: 500 });
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
