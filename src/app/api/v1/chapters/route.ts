import { NextResponse } from 'next/server';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    count: INITIAL_16_CHAPTERS.length,
    data: INITIAL_16_CHAPTERS,
  });
}
