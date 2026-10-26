import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import {
  districtTransferDecisionSchema,
  reviewCorrectionRequestSchema,
} from '@/features/memberships/schemas/member-governance.schema';

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
    const view = searchParams.get('view') || 'overview';

    if (view === 'overview') {
      const metrics = await MemberIdentityService.getGovernanceMetrics(actor);
      return NextResponse.json({ success: true, data: metrics });
    }

    if (view === 'transfers') {
      const status = (searchParams.get('status') as any) || undefined;
      const chapterId = searchParams.get('chapterId') || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const transfers = await MemberIdentityService.getChapterTransfers(actor, {
        status,
        chapterId,
        page,
        pageSize: 50,
      });
      return NextResponse.json({ success: true, ...transfers });
    }

    if (view === 'corrections') {
      const status = (searchParams.get('status') as any) || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const corrections = await MemberIdentityService.getCorrectionRequests(actor, {
        status,
        page,
        pageSize: 50,
      });
      return NextResponse.json({ success: true, ...corrections });
    }

    return NextResponse.json({ success: false, error: 'Invalid view parameter' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch governance data.' },
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
    const { action } = body;

    if (action === 'finalize_transfer') {
      const parsed = districtTransferDecisionSchema.parse(body.data);
      const result = await MemberIdentityService.districtAdminFinalizeTransfer(actor, parsed);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'review_correction') {
      const parsed = reviewCorrectionRequestSchema.parse(body.data);
      const result = await MemberIdentityService.reviewIdentityCorrection(actor, parsed);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'recommend_deactivation') {
      const { requestId, decision, reviewNotes } = body.data || {};
      if (!requestId || !decision || !reviewNotes) {
        return NextResponse.json(
          { success: false, error: 'requestId, decision, and reviewNotes are required.' },
          { status: 422 }
        );
      }
      const result = await MemberIdentityService.recommendMembershipDeactivation(actor, {
        requestId,
        decision,
        reviewNotes,
      });
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Expected finalize_transfer | review_correction | recommend_deactivation' },
      { status: 400 }
    );
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process governance action.' },
      { status }
    );
  }
}
