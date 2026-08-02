import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Client from '@/models/Client';
import { errorResponse } from '@/lib/api-helpers';
import {
  createClientSchema,
  objectIdSchema,
  patchClientSchema,
} from '@/lib/validation';

export async function GET() {
  try {
    await connectToDatabase();
    const clients = await Client.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(clients);
  } catch (e) {
    return errorResponse('Помилка завантаження бази клієнтів', 500, e);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірні дані клієнта', 400);
    }

    const { name, phone, source, date, service, notes } = parsed.data;

    const newVisit = {
      date: date || new Date().toLocaleDateString('uk-UA'),
      zones: service ? service.split(',').map((s) => s.trim()) : [],
      notes: notes || 'Заявка з сайту/квізу',
      price: 0,
    };

    const existingClient = await Client.findOne({ phone });

    if (existingClient) {
      existingClient.visits.push(newVisit);
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

    const newClient = await Client.create({
      name,
      phone,
      source: source || 'Сайт',
      visits: [newVisit],
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (e) {
    return errorResponse('Помилка створення або оновлення клієнта', 500, e);
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = patchClientSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірні дані оновлення', 400);
    }

    const { id, visits, nextAppointment, generalNotes } = parsed.data;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        ...(visits && { visits }),
        ...(nextAppointment !== undefined && { nextAppointment }),
        ...(generalNotes !== undefined && { generalNotes }),
      },
      { new: true },
    );

    if (!updatedClient) return errorResponse('Клієнта не знайдено', 404);
    return NextResponse.json(updatedClient);
  } catch (e) {
    return errorResponse('Помилка оновлення клієнта', 500, e);
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const idResult = objectIdSchema.safeParse(searchParams.get('id'));
    if (!idResult.success) {
      return errorResponse('ID не вказано', 400);
    }

    const deleted = await Client.findByIdAndDelete(idResult.data);
    if (!deleted) return errorResponse('Клієнта не знайдено', 404);

    return NextResponse.json({ message: 'Клієнта видалено' });
  } catch (e) {
    return errorResponse('Помилка видалення', 500, e);
  }
}
