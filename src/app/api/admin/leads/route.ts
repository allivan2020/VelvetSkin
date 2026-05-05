import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { generateLeadSummary } from '@/lib/groq';

// Универсальный обработчик ошибок для чистоты кода
const errorResponse = (message: string, status: number, error?: unknown) => {
  console.error(`[API ERROR] ${message}:`, error);

  // Извлекаем сообщение об ошибке безопасно
  const errorMessage = error instanceof Error ? error.message : String(error);

  return NextResponse.json(
    { error: message, details: errorMessage },
    { status },
  );
};

// 1. ПОЛУЧЕНИЕ СПИСКА
export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(leads);
  } catch (e) {
    return errorResponse('Помилка завантаження', 500, e);
  }
}

// 2. СОЗДАНИЕ НОВОЙ ЗАЯВКИ
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // Валидация
    const { name, contact, experience, selections } = body;
    if (!name || !contact) {
      return errorResponse('Ім’я та контактні дані обов’язкові', 400);
    }

    const safeSelections = Array.isArray(selections) ? selections : [];

    // AI Summary (не даем ошибке AI уронить весь роут)
    let aiSummary = 'AI аналіз недоступний';
    try {
      if (experience || safeSelections.length > 0) {
        aiSummary =
          (await generateLeadSummary({
            experience,
            selections: safeSelections,
          })) || aiSummary;
      }
    } catch (e) {
      console.error('AI Summary generation failed:', e);
    }

    const newLead = new Lead({
      name,
      contact,
      experience: experience || 'Не вказано',
      selections: safeSelections,
      aiSummary,
      type: 'Квіз',
      status: 'Новий',
      createdAt: new Date(),
    });

    const savedLead = await newLead.save();

    // Telegram (отправляем асинхронно, не дожидаясь ответа для ускорения API)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const message = `🔥 <b>НОВА ЗАЯВКА!</b>\n👤 <b>Ім'я:</b> ${name}\n📞 <b>Контакт:</b> ${contact}\n📊 <b>AI:</b> ${aiSummary}`;

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }).catch((err) => console.error('Telegram Notify Error:', err));
    }

    return NextResponse.json({ success: true, id: savedLead._id });
  } catch (e) {
    return errorResponse('Внутрішня помилка сервера при створенні', 500, e);
  }
}

// 3. ОБНОВЛЕНИЕ СТАТУСА
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, status } = await req.json();

    if (!id || !status) {
      return errorResponse('ID та статус обов’язкові', 400);
    }

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

// 4. УДАЛЕНИЕ
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('ID обов’язковий', 400);

    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) return errorResponse('Заявку не знайдено', 404);

    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse('Помилка видалення', 500, e);
  }
}
