import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';

export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Помилка завантаження' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // 1. Извлекаем ВСЕ данные, которые могут прийти и из квиза, и из кнопки
    const {
      name,
      phone,
      contact,
      service,
      experience,
      selections,
      type,
      answers,
    } = body;

    // 2. Формируем объект для базы максимально гибко
    const leadData = {
      name: name || 'Без імені',
      contact: contact || phone || 'Не вказано',
      // Сохраняем и конкретную услугу, и результаты квиза (selections/answers)
      service: service || 'Квіз/Інше',
      experience: experience || 'Не вказано',
      selections: selections || answers || (service ? [service] : []),
      type: type || 'Загальна заявка', // Тот самый тип (Запис з кнопки или Квіз)
      status: 'Новий',
      createdAt: new Date(), // Хорошим тоном будет явно указать дату
    };

    // Сохраняем в базу
    const newLead = await Lead.create(leadData);

    // 3. Telegram сообщение (уже работает, просто убедимся, что данные верны)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message =
        `<b>📌 Нова заявка (${leadData.type})</b>\n\n` +
        `<b>👤 Ім'я:</b> ${leadData.name}\n` +
        `<b>📞 Контакт:</b> ${leadData.contact}\n` +
        `<b>🛠 Послуга:</b> ${leadData.service}\n` +
        `<b>📊 Квіз/Вибір:</b> ${Array.isArray(leadData.selections) ? leadData.selections.join(', ') : leadData.selections}`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: unknown) {
    console.error('СБОЙ БАЗЫ:', error);
    return NextResponse.json({ error: 'Помилка на сервері' }, { status: 500 });
  }
}

// ДОБАВЛЕН МЕТОД PATCH ДЛЯ ОБНОВЛЕНИЯ СТАТУСА
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Недостатньо даних' }, { status: 400 });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updatedLead) {
      return NextResponse.json(
        { error: 'Заявку не знайдено' },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedLead);
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка оновлення' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Видалено' });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
