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
    const { name, phone, contact, service, experience, selections, type } =
      body;

    // Исправляем ошибку 500: мапим phone в contact, если contact не пришел
    const leadData = {
      name: name || 'Без імені',
      contact: contact || phone || 'Не вказано', // ПОЛЕ ИЗ ТВОЕЙ МОДЕЛИ
      experience: experience || 'Не вказано',
      selections: selections || (service ? [service] : []),
      status: 'Новий',
    };

    const newLead = await Lead.create(leadData);

    // Уведомление в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const message =
        `<b>📌 Нова заявка (${type || 'Сайт'})</b>\n\n` +
        `<b>👤 Ім'я:</b> ${leadData.name}\n` +
        `<b>📞 Контакт:</b> ${leadData.contact}\n` +
        `<b>🛠 Послуга:</b> ${service || 'Не вказано'}`;

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
    const detail = error instanceof Error ? error.message : 'Unknown';
    console.error('СБОЙ БАЗЫ:', detail);
    return NextResponse.json({ error: detail }, { status: 500 });
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
