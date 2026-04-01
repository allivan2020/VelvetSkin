import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

// Отримання ВСІХ відгуків для адмінки
export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при отриманні' },
      { status: 500 },
    );
  }
}

// Оновлення статусу (Одобрити/Приховати)
export async function PATCH(req: Request) {
  try {
    const { id, isApproved } = await req.json();
    await connectToDatabase();
    await Review.findByIdAndUpdate(id, { isApproved });
    return NextResponse.json({ message: 'Статус оновлено' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при оновленні' },
      { status: 500 },
    );
  }
}

// Видалення відгуку назавжди
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await connectToDatabase();
    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Відгук видалено' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при видаленні' },
      { status: 500 },
    );
  }
}
