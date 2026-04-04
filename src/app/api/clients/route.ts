import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Client from '@/models/Client';

// Отримати всіх клієнтів (для вкладки "База клієнтів")
export async function GET() {
  try {
    await connectToDatabase();
    // Сортуємо так, щоб ті, з ким працювали найновіше, були зверху
    const clients = await Client.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка завантаження бази клієнтів' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, phone, source, date, service, notes } = body;

    // Створюємо об'єкт нового візиту
    const newVisit = {
      date: date || new Date().toLocaleDateString('uk-UA'),
      zones: service ? service.split(',').map((s: string) => s.trim()) : [],
      notes: notes || 'Заявка з сайту/квізу',
      price: 0,
    };

    // Шукаємо клієнта за номером телефону
    const existingClient = await Client.findOne({ phone });

    if (existingClient) {
      // ЯКЩО КЛІЄНТ ІСНУЄ: Додаємо новий візит у його історію
      existingClient.visits.push(newVisit);
      // Оновлюємо дату останньої активності
      existingClient.updatedAt = new Date();
      await existingClient.save();

      return NextResponse.json(
        {
          message: 'Клієнта знайдено, історію візитів оновлено',
          client: existingClient,
        },
        { status: 200 },
      );
    }

    // ЯКЩО КЛІЄНТА НЕМАЄ: Створюємо нову картку
    const newClient = await Client.create({
      name,
      phone,
      source: source || 'Сайт',
      visits: [newVisit],
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Помилка API:', error);
    return NextResponse.json(
      { error: 'Помилка створення або оновлення клієнта' },
      { status: 500 },
    );
  }
}

// Оновити клієнта (додати новий візит, змінити дату наступного запису)
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, visits, nextAppointment, generalNotes } = body;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        ...(visits && { visits }),
        ...(nextAppointment !== undefined && { nextAppointment }),
        ...(generalNotes !== undefined && { generalNotes }),
      },
      { new: true },
    );

    return NextResponse.json(updatedClient);
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка оновлення клієнта' },
      { status: 500 },
    );
  }
}

// Видалити клієнта з бази
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id)
      return NextResponse.json({ error: 'ID не вказано' }, { status: 400 });

    await Client.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Клієнта видалено' });
  } catch (error) {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
