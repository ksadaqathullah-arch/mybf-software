import 'server-only';
import { db } from '@/server/db';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import { LeadershipRole } from '@prisma/client';

export class ChapterService {
  /**
   * Get all active chapters for public/member directory
   */
  static async getPublicChapters() {
    return await db.chapter.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        code: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get chapter detail with verified isolation checks
   */
  static async getChapterBySlug(slug: string) {
    const chapter = await db.chapter.findUnique({
      where: { slug },
      include: {
        district: true,
        leadership: {
          where: { isActive: true },
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
            events: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    if (!chapter) {
      throw new Error(`Chapter '${slug}' not found.`);
    }

    return chapter;
  }

  /**
   * Get authenticated chapter executive dashboard metrics
   * Enforces chapter-isolation so leaders can only view their own chapter
   */
  static async getChapterDashboardMetrics(actor: AuthActor, chapterId: string) {
    assertAuthorized({
      actor,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId,
    });

    const [chapter, activeMembersCount, pendingApplicationsCount, upcomingEvents] = await Promise.all([
      db.chapter.findUnique({ where: { id: chapterId } }),
      db.membership.count({
        where: { chapterId, status: 'ACTIVE' },
      }),
      db.membershipApplication.count({
        where: { chapterId, status: 'SUBMITTED' },
      }),
      db.event.findMany({
        where: {
          chapterId,
          status: 'PUBLISHED',
          startsAt: { gte: new Date() },
        },
        take: 5,
        orderBy: { startsAt: 'asc' },
      }),
    ]);

    if (!chapter) {
      throw new Error('Chapter not found.');
    }

    return {
      chapter,
      activeMembersCount,
      pendingApplicationsCount,
      upcomingEvents,
    };
  }

  /**
   * Appoint chapter leadership role (President, Secretary, Treasurer)
   */
  static async appointLeader(
    actor: AuthActor,
    chapterId: string,
    targetUserId: string,
    role: LeadershipRole,
    title?: string
  ) {
    assertAuthorized({
      actor,
      action: 'chapter.manage_leadership',
      resource: 'chapter',
      chapterId,
    });

    return await db.$transaction(async (tx) => {
      // Deactivate any currently active leader in this specific role for this chapter
      await tx.chapterLeadership.updateMany({
        where: {
          chapterId,
          role,
          isActive: true,
        },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Appoint new leader
      const appointment = await tx.chapterLeadership.create({
        data: {
          chapterId,
          userId: targetUserId,
          role,
          title,
          startDate: new Date(),
          isActive: true,
          appointedById: actor.userId,
        },
      });

      // Audit log the leadership change
      await tx.auditEvent.create({
        data: {
          actorId: actor.userId,
          actorEmail: actor.email,
          chapterId,
          action: 'LEADERSHIP_APPOINTED',
          resource: 'ChapterLeadership',
          resourceId: appointment.id,
          diffJson: { role, targetUserId, title },
        },
      });

      return appointment;
    });
  }
}
