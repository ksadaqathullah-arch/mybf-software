import { NextRequest, NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localBody = searchParams.get('localBody');

    if (!localBody) {
      return NextResponse.json(
        { success: false, error: 'Parameter "localBody" is required.' },
        { status: 400 }
      );
    }

    const wardResult = await GeographyService.getWards(localBody);

    return NextResponse.json({
      success: true,
      ...wardResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve wards.',
      },
      { status: 500 }
    );
  }
}
