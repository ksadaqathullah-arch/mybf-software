import { NextRequest, NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taluk = searchParams.get('taluk') || undefined;
    const typeParam = searchParams.get('type') || undefined;
    const type =
      typeParam === 'MUNICIPALITY' || typeParam === 'GRAMA_PANCHAYAT'
        ? (typeParam as 'MUNICIPALITY' | 'GRAMA_PANCHAYAT')
        : undefined;

    const localBodies = await GeographyService.getDatabaseLocalBodies(taluk, type);

    return NextResponse.json({
      success: true,
      taluk: taluk || 'ALL',
      count: localBodies.length,
      localBodies,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve local bodies.',
      },
      { status: 500 }
    );
  }
}
