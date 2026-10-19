import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import { chapterTransferRecommendationSchema } from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const direction = (searchParams.get('direction') as any) || 'ALL';
    const status = (searchParams.get('status') as any) || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await MemberIdentityService.getChapterTransfers(actor, {
      direction,
      status,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chapter transfer requests.' },
      { status: 403 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = chapterTransferRecommendationSchema.parse(body);

    const result = await MemberIdentityService.reviewChapterTransferRecommendation(actor, parsed);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit chapter transfer review.' },
      { status }
    );
  }
}
