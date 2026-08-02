import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { errorResponse } from '@/lib/api-helpers';
import { objectIdSchema, patchLeadSchema } from '@/lib/validation';
import { createPublicLead } from '@/lib/create-lead';

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(leads);
  } catch (e) {
    return errorResponse('Помилка завантаження', 500, e);
  }
}

/**
 * Backward-compatible public POST.
 * Old cached clients may still hit /api/admin/leads — keep working.
 * Auth is skipped for this method in middleware.
 */
export async function POST(req: Request) {
  try {
    return await createPublicLead(req);
  } catch (e) {
    return errorResponse('Внутрішня помилка сервера при створенні', 500, e);
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = patchLeadSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('ID та статус обов’язкові', 400);
    }

    const { id, status } = parsed.data;
    const updated = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!updated) return errorResponse('Заявку не знайдено', 404);
    return NextResponse.json(updated);
  } catch (e) {
    return errorResponse('Помилка оновлення', 500, e);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const idResult = objectIdSchema.safeParse(searchParams.get('id'));
    if (!idResult.success) return errorResponse('ID обов’язковий', 400);

    const deleted = await Lead.findByIdAndDelete(idResult.data);
    if (!deleted) return errorResponse('Заявку не знайдено', 404);

    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse('Помилка видалення', 500, e);
  }
}
