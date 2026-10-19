import { NextRequest, NextResponse } from 'next/server';
import { GeographyService } from '@/features/geography/server/geography.service';
import { locationSelectionSchema } from '@/features/geography/schemas/location.schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = locationSelectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: parsed.error.issues[0]?.message || 'Invalid location payload.',
        },
        { status: 400 }
      );
    }

    const result = await GeographyService.validateLocationHierarchy({
      taluk: parsed.data.taluk,
      localBody: parsed.data.localBody,
      ward: parsed.data.ward,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: result.error,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      resolvedLocalBody: result.resolvedLocalBody,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Location validation failed.',
      },
      { status: 500 }
    );
  }
}
