import Groq from 'groq-sdk';
import { getGroqModel } from '@/lib/groq-model';

export interface QuizData {
  experience?: string;
  selections?: string[];
}

// Ініціалізація клієнта
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateLeadSummary(data: QuizData): Promise<string> {
  console.log('🤖 ІІ (Groq) отримав дані:', data);

  // Одразу форматуємо дані, щоб використовувати їх і для промпту, і для заглушки
  const exp = data.experience || 'не вказано';
  const options = data.selections?.length
    ? data.selections.join(', ')
    : 'не вказані';
  const fallbackSummary = `Увага майстру: клієнт - досвід: "${exp}". Побажання: ${options}.`;

  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️ Не знайдено GROQ_API_KEY, використовую заглушку.');
    return fallbackSummary;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Ти — старший адміністратор салону VelvetSkin. Твоя задача — дати коротку пораду майстру (максимум 2 речення) на основі даних з квізу клієнта. Відповідай виключно українською мовою, професійно та лаконічно.',
        },
        {
          role: 'user',
          content: `Досвід клієнта: ${exp}. Побажання клієнта: ${options}.`,
        },
      ],
      model: getGroqModel(),
      temperature: 0.4,
      max_tokens: 150,
    });

    const text = response.choices[0]?.message?.content;

    if (!text) throw new Error('Порожня відповідь від ІІ');

    console.log('✅ ІІ успішно згенерував відповідь!');
    return text.trim();
  } catch (error) {
    console.error(
      '❌ Помилка Groq API:',
      error instanceof Error ? error.message : error,
    );

    // Повертаємо надійну заглушку у разі будь-якого збою
    return fallbackSummary;
  }
}
