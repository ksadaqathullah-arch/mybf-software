import { NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const taluks = await GeographyService.getDatabaseTaluks();
    return NextResponse.json({
      success: true,
      district: 'Malappuram',
      taluks,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve taluks.',
      },
      { status: 500 }
    );
  }
}
