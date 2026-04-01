import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

// GET-запрос: получаем одобренные отзывы для отображения на сайте
export async function GET() {
  try {
    await connectToDatabase();
    // Ищем только те отзывы, где isApproved: true. Сортируем по новизне (-1)
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

// POST-запрос: сохраняем новый отзыв из формы
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

    // Создаем новый отзыв. isApproved автоматически станет false благодаря нашей Схеме
    const newReview = new Review({
      name,
      text,
    });

    await newReview.save();

    return NextResponse.json(
      { message: 'Відгук успішно додано' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при збереженні відгуку' },
      { status: 500 },
    );
  }
}
