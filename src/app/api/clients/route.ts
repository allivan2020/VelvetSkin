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

// Створити нового клієнта (при натисканні "Прийняти")
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, phone, source, date, service, notes } = body;

    // Перевірка дублікатів по номеру телефону
    const existingClient = await Client.findOne({ phone });
    if (existingClient) {
      return NextResponse.json(
        { error: 'Клієнт з таким номером телефону вже існує!' },
        { status: 400 },
      );
    }

    // Створюємо картку клієнта з його першим візитом
    const newClient = await Client.create({
      name,
      phone,
      source: source || 'Не вказано',
      visits: [
        {
          date: date || new Date().toLocaleDateString('uk-UA'),
          zones: service ? [service] : [],
          notes: notes || 'Перший візит',
        },
      ],
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка створення клієнта' },
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
