import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/api-helpers';
import { agentChatSchema } from '@/lib/validation';
import { confirmAgentAction, runAdminAgent } from '@/lib/admin-agent';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = agentChatSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Невірне повідомлення', 400);
    }

    if (parsed.data.confirm) {
      const result = await confirmAgentAction(parsed.data.confirm);
      return NextResponse.json(result);
    }

    const message = parsed.data.message?.trim() || '';
    const result = await runAdminAgent(message, parsed.data.history);

    return NextResponse.json(result);
  } catch (e) {
    return errorResponse('Помилка агента', 500, e);
  }
}
