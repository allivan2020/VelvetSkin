import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import { errorResponse } from '@/lib/api-helpers';
import {
  objectIdSchema,
  patchReviewSchema,
} from '@/lib/validation';

export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (e) {
    return errorResponse('Помилка завантаження відгуків', 500, e);
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = patchReviewSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірні дані', 400);
    }

    const { id, isApproved } = parsed.data;
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    );

    if (!updatedReview) return errorResponse('Відгук не знайдено', 404);
    return NextResponse.json(updatedReview);
  } catch (e) {
    return errorResponse('Помилка оновлення', 500, e);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const idResult = objectIdSchema.safeParse(searchParams.get('id'));
    if (!idResult.success) {
      return errorResponse('ID обов’язковий', 400);
    }

    const deleted = await Review.findByIdAndDelete(idResult.data);
    if (!deleted) return errorResponse('Відгук не знайдено', 404);

    return NextResponse.json({ message: 'Видалено' });
  } catch (e) {
    return errorResponse('Помилка видалення', 500, e);
  }
}
