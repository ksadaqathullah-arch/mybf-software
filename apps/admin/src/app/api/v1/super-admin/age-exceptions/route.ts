import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth';
import { MembershipService } from '@/server/membership.service';
import { superAdminAgeExceptionReviewSchema } from '@/server/admin-schemas';
import type { AuthActor } from '@/server/types';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE' || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const exceptions = await MembershipService.getPendingAgeExceptions(actor);

    return NextResponse.json({
      success: true,
      exceptions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch age exception reviews.' },
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
    const parsed = superAdminAgeExceptionReviewSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MembershipService.reviewAgeException(actor, parsed.data);

    return NextResponse.json({
      success: true,
      decision: parsed.data.decision,
      status: result.status,
      message:
        parsed.data.decision === 'APPROVE'
          ? 'Age exception approved. The application is now unblocked for chapter leadership review.'
          : 'Age exception rejected. Application has been marked as rejected.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to review age exception.' },
      { status: 400 }
    );
  }
}
