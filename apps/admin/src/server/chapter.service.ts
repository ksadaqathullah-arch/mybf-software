import 'server-only';
import { LeadershipRole } from '@prisma/client';
import { db } from './db';
import type { AuthActor } from './types';

async function resolveAuditActorId(tx: any, userId: string) {
  const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
  return user ? user.id : null;
}

export class ChapterService {
  /**
   * Appoint chapter leader (Super Admin authority)
   */
  static async appointLeader(
    actor: AuthActor,
    chapterId: string,
    targetUserId: string,
    role: LeadershipRole,
    title?: string,
    startDate: Date = new Date(),
    endDate?: Date | null
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator access required.');
    }

    return await db.$transaction(async (tx) => {
      // 1. Deactivate prior leader in this specific role
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

      // 2. Create ChapterLeadership record
      const appointment = await tx.chapterLeadership.create({
        data: {
          chapterId,
          userId: targetUserId,
          role,
          title,
          startDate,
          endDate,
          isActive: true,
          appointedById: actor.userId,
        },
      });

      // 3. Synchronize UserRoleAssignment for RBAC policy checks
      const roleCode =
        role === 'PRESIDENT'
          ? 'CHAPTER_PRESIDENT'
          : role === 'SECRETARY'
          ? 'CHAPTER_SECRETARY'
          : role === 'TREASURER'
          ? 'CHAPTER_TREASURER'
          : 'CHAPTER_COORDINATOR';

      const systemRole = await tx.role.findUnique({
        where: { code: roleCode },
      });

      if (systemRole) {
        const chapterRecord = await tx.chapter.findUnique({
          where: { id: chapterId },
          select: { organizationId: true, districtId: true },
        });

        const existingAssignment = await tx.userRoleAssignment.findFirst({
          where: {
            userId: targetUserId,
            roleId: systemRole.id,
            chapterId,
          },
        });

        if (!existingAssignment) {
          await tx.userRoleAssignment.create({
            data: {
              userId: targetUserId,
              roleId: systemRole.id,
              organizationId: chapterRecord?.organizationId,
              districtId: chapterRecord?.districtId,
              chapterId,
              expiresAt: endDate,
              appointedById: await resolveAuditActorId(tx, actor.userId),
            },
          });
        } else if (endDate) {
          await tx.userRoleAssignment.update({
            where: { id: existingAssignment.id },
            data: { expiresAt: endDate },
          });
        }
      }

      // 4. Immutable Audit Event
      await tx.auditEvent.create({
        data: {
          actorId: await resolveAuditActorId(tx, actor.userId),
          actorEmail: actor.email,
          chapterId,
          action: 'LEADERSHIP_APPOINTED',
          resource: 'ChapterLeadership',
          resourceId: appointment.id,
          diffJson: { role, targetUserId, title, startDate: startDate.toISOString(), endDate: endDate?.toISOString() },
        },
      });

      return appointment;
    });
  }

  /**
   * Revoke chapter leadership role
   */
  static async revokeLeader(
    actor: AuthActor,
    chapterId: string,
    appointmentId: string,
    reason?: string
  ) {
    if (!actor || !actor.roles.includes('SUPER_ADMIN')) {
      throw new Error('Forbidden: Super Administrator access required.');
    }

    return await db.$transaction(async (tx) => {
      const existing = await tx.chapterLeadership.findFirst({
        where: { id: appointmentId, chapterId },
      });

      if (!existing) {
        throw new Error('Leadership appointment not found.');
      }

      const revoked = await tx.chapterLeadership.update({
        where: { id: appointmentId },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Revoke corresponding system role assignment
      const roleCode =
        existing.role === 'PRESIDENT'
          ? 'CHAPTER_PRESIDENT'
          : existing.role === 'SECRETARY'
          ? 'CHAPTER_SECRETARY'
          : existing.role === 'TREASURER'
          ? 'CHAPTER_TREASURER'
          : 'CHAPTER_COORDINATOR';

      const systemRole = await tx.role.findUnique({
        where: { code: roleCode },
      });

      if (systemRole) {
        await tx.userRoleAssignment.deleteMany({
          where: {
            userId: existing.userId,
            roleId: systemRole.id,
            chapterId,
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorId: await resolveAuditActorId(tx, actor.userId),
          actorEmail: actor.email,
          chapterId,
          action: 'LEADERSHIP_REVOKED',
          resource: 'ChapterLeadership',
          resourceId: appointmentId,
          diffJson: { reason, previousRole: existing.role },
        },
      });

      return revoked;
    });
  }
}
