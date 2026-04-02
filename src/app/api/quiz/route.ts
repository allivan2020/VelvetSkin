import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead'; // Подключаем модель Лида

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { experience, selections, name, contact } = body;

    // 1. ПІДКЛЮЧАЄМОСЬ ДО БАЗИ ТА ЗБЕРІГАЄМО ЛІД
    await connectToDatabase();
    const safeSelections = Array.isArray(selections) ? selections : [];

    const newLead = new Lead({
      name,
      contact,
      experience,
      selections: safeSelections,
      status: 'Новий',
    });

    await newLead.save(); // Зберегли в MongoDB!

    // 2. ВІДПРАВЛЯЄМО В TELEGRAM
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('ПОМИЛКА: Немає токена або ID чату в .env');
      return NextResponse.json(
        { error: 'Відсутні ключі Telegram' },
        { status: 500 },
      );
    }

    const safeName = String(name || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const safeContact = String(contact || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const message = `
🔥 <b>НОВА ЗАЯВКА З КВІЗУ! (Сайт)</b> 🔥

👤 <b>Ім'я:</b> ${safeName}
📞 <b>Контакт:</b> ${safeContact}

📊 <b>Клієнт:</b> ${experience || 'Не вказано'}
🎯 <b>Вибір:</b> ${safeSelections.length > 0 ? safeSelections.join(', ') : 'Нічого не обрано'}
    `;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const telegramData = await response.json();
      console.error('Помилка від самого Telegram:', telegramData);
      return NextResponse.json(
        { error: `Telegram Error: ${telegramData.description}` },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Заявка збережена та відправлена',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Невідома помилка';
    console.error('Quiz API Catch Error:', errorMessage);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера', details: errorMessage },
      { status: 500 },
    );
  }
}
