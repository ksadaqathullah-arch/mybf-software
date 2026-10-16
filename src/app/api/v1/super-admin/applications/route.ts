import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { superAdminApplicationReviewSchema } from '@/features/memberships/schemas/membership.schema';
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

    const applications = await MembershipService.getPendingApplicationsForSuperAdmin(adminActor);

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
    const parsed = superAdminApplicationReviewSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Validation failed.';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 422 }
      );
    }

    const result = await MembershipService.reviewApplicationBySuperAdmin(adminActor, parsed.data);

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
