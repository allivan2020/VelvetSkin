// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Описываем тип входных данных, чтобы не было "any"
interface QuizData {
  experience?: string;
  selections?: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function generateLeadSummary(
  data: QuizData,
): Promise<string | null> {
  // Добавим лог, который ты точно увидишь в терминале
  console.log('🤖 ИИ получил данные:', data);

  try {
   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `
      Ти — старший адміністратор салону VelvetSkin. 
      На основі досвіду клієнта (${data.experience || 'не вказано'}) 
      та обраних зон (${data.selections?.join(', ') || 'не обрано'})
      дай коротку пораду майстру (2 речення). Українською мовою.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('✅ ИИ сгенерировал ответ!');
    return text;
  } catch (error) {
    // Вместо (error: any) используем проверку типа
    if (error instanceof Error) {
      console.error('❌ Ошибка Gemini:', error.message);
    }
    return null;
  }
}
