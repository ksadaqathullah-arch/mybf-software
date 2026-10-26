import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';

export const dynamic = 'force-dynamic';

const deactivationRequestSchema = z.object({
  memberProfileId: z.string().uuid('Valid member profile ID required'),
  reason: z.string().trim().min(10, 'Mandatory reason must be at least 10 characters'),
  category: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active chapter officer session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = deactivationRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation error.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MemberIdentityService.requestMembershipDeactivation(actor, parsed.data);

    return NextResponse.json({
      success: true,
      message: result.message,
      requestId: result.requestId,
    });
  } catch (error: any) {
    const status = error.message?.includes('Forbidden') ? 403 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit membership removal request.' },
      { status }
    );
  }
}
