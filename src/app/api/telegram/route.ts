// src/app/api/telegram/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, service, captcha } = body;

    // 1. Проверяем токен капчи
    if (!captcha) {
      return NextResponse.json({ error: 'Капча відсутня' }, { status: 400 });
    }

    const turnstileVerifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${captcha}`,
      },
    );

    const turnstileData = await turnstileVerifyResponse.json();

    if (!turnstileData.success) {
      return NextResponse.json({ error: 'Капча не пройдена' }, { status: 403 });
    }

    // 2. Отправляем в Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `
💅 <b>Новий запис VelvetSkin!</b>

👤 <b>Ім'я:</b> ${name}
📞 <b>Телефон:</b> ${phone}
✨ <b>Послуга:</b> ${service || 'Не обрана'}
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
      throw new Error('Помилка відправки в Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram/Turnstile Error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 },
    );
  }
}
