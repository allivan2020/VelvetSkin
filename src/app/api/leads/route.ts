import { NextResponse } from 'next/server';
import { createPublicLead } from '@/lib/create-lead';

export async function POST(req: Request) {
  try {
    return await createPublicLead(req);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера при створенні' },
      { status: 500 },
    );
  }
}
