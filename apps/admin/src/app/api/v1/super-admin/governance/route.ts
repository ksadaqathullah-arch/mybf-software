import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import { superAdminTransferOverrideSchema } from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
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
        pageSize: 100,
      });
      return NextResponse.json({ success: true, ...transfers });
    }

    if (view === 'corrections') {
      const status = (searchParams.get('status') as any) || undefined;
      const page = parseInt(searchParams.get('page') || '1', 10);
      const corrections = await MemberIdentityService.getCorrectionRequests(actor, {
        status,
        page,
        pageSize: 100,
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
    if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (body.action === 'finalize_deactivation') {
      const { requestId, decision, justification } = body.data || body;
      if (!requestId || !decision || !justification) {
        return NextResponse.json(
          { success: false, error: 'requestId, decision (APPROVE_DEACTIVATION | REJECT), and justification are required.' },
          { status: 422 }
        );
      }
      const result = await MemberIdentityService.finalizeMembershipDeactivation(actor, {
        requestId,
        action: decision,
        justification,
      });
      return NextResponse.json({ success: true, data: result });
    }

    const parsed = superAdminTransferOverrideSchema.parse(body);

    const result = await MemberIdentityService.superAdminOverrideTransfer(actor, parsed);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 403;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to apply governance override.' },
      { status }
    );
  }
}
