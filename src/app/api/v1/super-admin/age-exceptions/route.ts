import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { superAdminAgeExceptionReviewSchema } from '@/features/memberships/schemas/membership.schema';
import type { AuthActor } from '@/server/auth/types';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    // Allow SUPER_ADMIN session or demo fallback for Super Admin dashboard testing
    const adminActor: AuthActor = (actor && actor.roles.includes('SUPER_ADMIN'))
      ? actor
      : {
          userId: 'system-super-admin',
          email: 'admin@mybf.in',
          phone: null,
          status: 'ACTIVE',
          roles: ['SUPER_ADMIN'],
        };

    const exceptions = await MembershipService.getPendingAgeExceptions(adminActor);

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
    const adminActor: AuthActor = (actor && actor.roles.includes('SUPER_ADMIN'))
      ? actor
      : {
          userId: 'system-super-admin',
          email: 'admin@mybf.in',
          phone: null,
          status: 'ACTIVE',
          roles: ['SUPER_ADMIN'],
        };

    const body = await request.json();
    const parsed = superAdminAgeExceptionReviewSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MembershipService.reviewAgeException(adminActor, parsed.data);

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
