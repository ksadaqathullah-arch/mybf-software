import { NextRequest, NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const localBody = searchParams.get('localBody');
    const taluk = searchParams.get('taluk') || undefined;

    if (!localBody) {
      return NextResponse.json(
        { error: 'localBody query parameter is required' },
        { status: 400 }
      );
    }

    const result = await GeographyService.getPostOfficesByLocalBody({ localBody, taluk });
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to lookup post offices by local body' },
      { status: 500 }
    );
  }
}
