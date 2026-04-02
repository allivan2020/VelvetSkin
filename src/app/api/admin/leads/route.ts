import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET() {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { name, phone, service, status, type } = body;

    const newLead = await Lead.create({
      name,
      phone,
      service: service || 'Не вказано',
      status: status || 'Новий',
      type: type || 'Запит з сайту',
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: unknown) {
    console.error('ПОМИЛКА ЗБЕРЕЖЕННЯ:', error);
    return NextResponse.json(
      { error: 'Помилка при збереженні в базу' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id)
      return NextResponse.json({ error: 'ID не вказано' }, { status: 400 });
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Видалено' });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
