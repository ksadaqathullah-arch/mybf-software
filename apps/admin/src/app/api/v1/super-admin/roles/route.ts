import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/server/auth';
import { SuperAdminService } from '@/server/super-admin.service';
import { db } from '@/server/db';
import type { SystemRoleCode } from '@/server/types';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const actor = {
      userId: admin.id,
      email: admin.email,
      phone: admin.phone,
      status: 'ACTIVE' as const,
      roles: admin.roles as any,
    };


    const [users, availableRoles] = await Promise.all([
      db.user.findMany({
        include: {
          profile: {
            select: { fullName: true, primaryPhone: true },
          },
          roleAssignments: {
            include: {
              role: true,
              chapter: { select: { id: true, code: true, name: true } },
            },
            orderBy: { assignedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.role.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      status: u.status,
      fullName: u.profile?.fullName || u.username || u.email || 'Unnamed User',
      phone: u.profile?.primaryPhone || u.phone,
      roles: u.roleAssignments.map((ra) => ({
        id: ra.id,
        roleCode: ra.role.code,
        roleName: ra.role.name,
        chapter: ra.chapter,
        createdAt: ra.assignedAt.toISOString(),
      })),
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      roles: availableRoles,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch roles.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const actor = {
      userId: admin.id,
      email: admin.email,
      phone: admin.phone,
      status: 'ACTIVE' as const,
      roles: admin.roles as any,
    };

    const body = await request.json();
    const { targetUserId, roleCode, chapterId } = body;

    if (!targetUserId || !roleCode) {
      return NextResponse.json(
        { success: false, error: 'Target user ID and role code are required.' },
        { status: 400 }
      );
    }

    const result = await SuperAdminService.assignSystemRole(
      actor,
      targetUserId,
      roleCode as SystemRoleCode,
      undefined,
      undefined,
      chapterId
    );

    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to assign role.' },
      { status }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Super Administrator credentials required.' },
        { status: 403 }
      );
    }

    const actor = {
      userId: admin.id,
      email: admin.email,
      phone: admin.phone,
      status: 'ACTIVE' as const,
      roles: admin.roles as any,
    };

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    const roleCode = searchParams.get('roleCode') as SystemRoleCode;

    if (!targetUserId || !roleCode) {
      return NextResponse.json(
        { success: false, error: 'Target user ID and role code parameters required.' },
        { status: 400 }
      );
    }

    const result = await SuperAdminService.revokeSystemRole(actor, targetUserId, roleCode);

    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to revoke role.' },
      { status }
    );
  }
}
