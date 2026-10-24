import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth';
import { MembershipService } from '@/server/membership.service';
import { superAdminApplicationReviewSchema } from '@/server/admin-schemas';
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

    const applications = await MembershipService.getPendingApplicationsForSuperAdmin(actor);

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch membership applications.' },
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
    const parsed = superAdminApplicationReviewSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MembershipService.reviewApplicationBySuperAdmin(actor, parsed.data);

    return NextResponse.json({
      success: true,
      action: parsed.data.action,
      status: result.status,
      membershipNumber: result.membershipNumber,
      message:
        parsed.data.action === 'APPROVE'
          ? `Application approved. Member ID ${result.membershipNumber} issued and account activated.`
          : 'Application rejected.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process application review.' },
      { status: 400 }
    );
  }
}
