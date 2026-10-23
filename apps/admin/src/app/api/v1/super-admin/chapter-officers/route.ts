import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { ChapterService } from '@/features/chapters/server/chapter.service';
import { db } from '@/server/db';
import { LeadershipRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    const leadership = await db.chapterLeadership.findMany({
      where: chapterId ? { chapterId } : undefined,
      include: {
        chapter: {
          select: { id: true, code: true, name: true, slug: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            profile: { select: { fullName: true, primaryPhone: true } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, leadership });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list chapter leadership' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, chapterId, role, title, startDate, endDate } = body;

    if (!userId || !chapterId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, chapterId, role' },
        { status: 400 }
      );
    }

    const validRoles: LeadershipRole[] = [
      'PRESIDENT',
      'SECRETARY',
      'TREASURER',
      'VICE_PRESIDENT',
      'JOINT_SECRETARY',
      'COORDINATOR',
      'DIRECTOR',
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : null;

    const appointment = await ChapterService.appointLeader(
      actor,
      chapterId,
      userId,
      role as LeadershipRole,
      title,
      start,
      end
    );

    return NextResponse.json({
      success: true,
      message: `Successfully appointed ${role} for chapter`,
      appointment,
    });
  } catch (error: any) {
    const status = error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to appoint chapter leader' }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { chapterId, appointmentId, reason } = body;

    if (!chapterId || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields: chapterId, appointmentId' },
        { status: 400 }
      );
    }

    const revoked = await ChapterService.revokeLeader(
      actor,
      chapterId,
      appointmentId,
      reason
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully revoked chapter leadership appointment',
      revoked,
    });
  } catch (error: any) {
    const status = error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Failed to revoke chapter leadership' }, { status });
  }
}
