import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { generateLeadSummary } from '@/lib/groq';

// 1. ПОЛУЧЕНИЕ СПИСКА (для админки)
export async function GET() {
  try {
    await connectToDatabase();
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch {
    return NextResponse.json(
      { error: 'Помилка завантаження' },
      { status: 500 },
    );
  }
}

// 2. СОЗДАНИЕ НОВОЙ ЗАЯВКИ (из квиза)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { experience, selections, name, contact } = body;

    const safeSelections = Array.isArray(selections) ? selections : [];

    // Ждем ИИ (используем 1.5-flash, чтобы не вылетало по квоте)
    let aiSummary = null;
    try {
      aiSummary = await generateLeadSummary({
        experience,
        selections: safeSelections,
      });
    } catch (e) {
      console.error('AI Error:', e);
    }

    const newLead = new Lead({
      name,
      contact,
      experience,
      selections: safeSelections,
      aiSummary,
      type: 'Квіз',
      status: 'Новий',
      createdAt: new Date(),
    });

    await newLead.save();

    // Telegram (фоном)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const message = `🔥 <b>НОВА ЗАЯВКА!</b>\n👤 ${name}\n📊 <b>AI:</b> ${aiSummary || 'Немає'}`;
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }).catch((err) => console.error('TG Error:', err));
    }

    return NextResponse.json({ success: true, aiSummary });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Внутрішня помилка' }, { status: 500 });
  }
}

// 3. ОБНОВЛЕНИЕ СТАТУСА (для кнопок "Прийняти")
export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { id, status } = await req.json();
    const updated = await Lead.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Помилка оновлення' }, { status: 500 });
  }
}

// 4. УДАЛЕНИЕ (для кнопки "Відхилити")
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await Lead.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Помилка видалення' }, { status: 500 });
  }
}
