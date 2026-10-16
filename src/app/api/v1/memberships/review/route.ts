import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { applicationReviewSchema } from '@/features/memberships/schemas/membership.schema';

/**
 * POST /api/v1/memberships/review
 * Chapter officer or admin Maker-Checker application review endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = applicationReviewSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid review payload.';
      return NextResponse.json({ success: false, error: firstError }, { status: 422 });
    }

    const result = await MembershipService.reviewApplication(actor, parsed.data);

    return NextResponse.json({
      success: true,
      status: result.status,
      message: (result as any).message,
      membershipNumber: result.membershipNumber,
      activationUrl: result.activationUrl,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || (error.message?.includes('Forbidden') ? 403 : 400);
    return NextResponse.json(
      { success: false, error: error.message || 'Review failed.' },
      { status: statusCode }
    );
  }
}
