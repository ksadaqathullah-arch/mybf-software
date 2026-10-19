import { NextRequest, NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pinCode = searchParams.get('pinCode');

    if (!pinCode) {
      return NextResponse.json(
        { error: 'pinCode query parameter is required (e.g. 676121)' },
        { status: 400 }
      );
    }

    const result = await GeographyService.lookupPostOfficesByPin(pinCode);
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to lookup post offices by PIN' },
      { status: 500 }
    );
  }
}
