import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

// Обработка GET-запроса: получение всех лидов для админки
export async function GET() {
  try {
    await dbConnect();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Ошибка API (GET):', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить лиды' },
      { status: 500 },
    );
  }
}

// Обработка POST-запроса: создание нового лида (из квиза или кнопки)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const newLead = await Lead.create(body);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('Ошибка API (POST):', error);
    return NextResponse.json(
      { error: 'Ошибка при сохранении данных' },
      { status: 500 },
    );
  }
}

// Обработка DELETE-запроса: удаление лида (кнопка "Видалити")
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID не указан' }, { status: 400 });
    }

    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Лид удален' });
  } catch (error) {
    console.error('Ошибка API (DELETE):', error);
    return NextResponse.json({ error: 'Ошибка при удалении' }, { status: 500 });
  }
}
