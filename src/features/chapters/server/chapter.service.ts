import 'server-only';
import { db } from '@/server/db';
import { assertAuthorized } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';
import { LeadershipRole, MeetingType, ActionItemStatus, Prisma } from '@prisma/client';
import { calculateAge } from '@/features/memberships/constants/youth-discovery';

export interface ChapterApplicationFilter {
  category?: string;
  position?: string;
  search?: string;
}

export interface ChapterMemberFilter {
  category?: string;
  position?: string;
  status?: string;
  search?: string;
}

export interface ScheduleMeetingInput {
  title: string;
  type: MeetingType;
  scheduledAt: Date | string;
  venue: string;
  agenda?: string;
  coordinatorName?: string;
}

async function resolveAuditActorId(tx: Prisma.TransactionClient, actorUserId?: string | null): Promise<string | null> {
  if (!actorUserId) return null;
  const user = await tx.user.findUnique({ where: { id: actorUserId }, select: { id: true } });
  return user ? user.id : null;
}

export class ChapterService {
  /**
   * Resolve chapter canonical record by either slug or UUID ID
   */
  static async getChapterBySlugOrId(slugOrId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    return await db.chapter.findFirst({
      where: isUuid ? { OR: [{ id: slugOrId }, { slug: slugOrId.toLowerCase() }] } : { slug: slugOrId.toLowerCase() },
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
      },
    });
  }

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
      where: { slug: slug.toLowerCase() },
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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      chapter,
      activeMembersCount,
      totalApprovedMembers,
      approvedThisMonthCount,
      pendingApplicationsCount,
      upcomingMeetingsCount,
      eventsConductedCount,
      totalAttendanceCount,
      pendingActionItemsCount,
      recentMeetings,
      leadershipRecords,
    ] = await Promise.all([
      db.chapter.findUnique({ where: { id: chapterId } }),
      db.membership.count({
        where: { chapterId, status: 'ACTIVE' },
      }),
      db.membership.count({
        where: { chapterId },
      }),
      db.membership.count({
        where: { chapterId, status: 'ACTIVE', createdAt: { gte: startOfMonth } },
      }),
      db.membershipApplication.count({
        where: { chapterId, status: 'SUBMITTED' },
      }),
      db.meeting.count({
        where: { chapterId, scheduledAt: { gte: now } },
      }),
      db.event.count({
        where: { chapterId, startsAt: { lt: now } },
      }),
      db.attendanceRecord.count({
        where: { event: { chapterId } },
      }),
      db.actionItem.count({
        where: { meeting: { chapterId }, status: 'PENDING' },
      }),
      db.meeting.findMany({
        where: { chapterId },
        orderBy: { scheduledAt: 'desc' },
        take: 5,
        include: {
          minutes: true,
          actionItems: true,
        },
      }),
      db.chapterLeadership.findMany({
        where: { chapterId, isActive: true },
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    if (!chapter) {
      throw new Error('Chapter not found.');
    }

    return {
      chapter,
      activeMembersCount,
      totalApprovedMembers,
      approvedThisMonthCount,
      pendingApplicationsCount,
      upcomingMeetingsCount,
      eventsConductedCount,
      totalAttendanceCount,
      pendingActionItemsCount,
      recentMeetings,
      leadershipRecords,
    };
  }

  /**
   * Get chapter membership applications scoped strictly to chapter
   */
  static async getChapterApplications(
    actor: AuthActor,
    chapterId: string,
    filters?: ChapterApplicationFilter
  ) {
    assertAuthorized({
      actor,
      action: 'member.review_application',
      resource: 'membership_application',
      chapterId,
    });

    const applications = await db.membershipApplication.findMany({
      where: {
        chapterId,
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formatted = applications.map((app) => {
      const p = (app.payloadJson as Record<string, any>) || {};
      const dob = app.user.profile?.dateOfBirth
        ? app.user.profile.dateOfBirth.toISOString().split('T')[0]
        : p.dateOfBirth || '';
      const applicantAge = p.applicantAge ?? (dob ? calculateAge(dob) : undefined);
      const requiresAgeException = Boolean(p.requestAgeException || p.ageException?.requested);

      return {
        id: app.id,
        userId: app.userId,
        fullName: app.user.profile?.fullName || p.fullName || 'Applicant',
        email: app.user.email || p.email || '',
        phone: app.user.phone || p.primaryPhone || '',
        memberCategory: (app.memberCategory || p.memberCategory || 'OTHER') as string,
        currentPosition: (app.currentPosition || p.currentPosition || 'OTHER') as string,
        occupation: app.user.profile?.occupation || p.occupation || '',
        companyName: app.user.profile?.companyName || p.companyName || '',
        businessSector: app.user.profile?.businessSector || p.businessSector || p.occupation || 'General',
        submittedAt: app.submittedAt.toISOString(),
        dateOfBirth: dob,
        applicantAge,
        requiresAgeException,
        ageExceptionStatus: (p.ageException?.status || 'NOT_REQUIRED') as string,
        status: app.status,
        reviewNotes: app.reviewNotes,
        rejectionReason: app.rejectionReason,
        chapterRecommendation: p.chapterRecommendation || null,
        expectations: p.expectations || [],
        talents: p.talents || [],
        participationPreferences: p.participationPreferences || [],
        futureGoal: p.futureGoal || '',
      };
    });

    // Apply optional memory filters if requested
    return formatted.filter((app) => {
      if (filters?.category && filters.category !== 'ALL' && app.memberCategory !== filters.category) {
        return false;
      }
      if (filters?.position && filters.position !== 'ALL' && app.currentPosition !== filters.position) {
        return false;
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = app.fullName.toLowerCase().includes(q);
        const matchesSector = app.businessSector.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesPhone = app.phone.includes(q);
        if (!matchesName && !matchesSector && !matchesEmail && !matchesPhone) return false;
      }
      return true;
    });
  }

  /**
   * Get chapter member directory / roster scoped strictly to chapter
   */
  static async getChapterMembers(
    actor: AuthActor,
    chapterId: string,
    filters?: ChapterMemberFilter
  ) {
    assertAuthorized({
      actor,
      action: 'member.read_chapter',
      resource: 'chapter',
      chapterId,
    });

    const memberships = await db.membership.findMany({
      where: {
        chapterId,
        status: 'ACTIVE',
      },
      include: {
        memberProfile: true,
        chapter: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const profileIds = memberships.map((m) => m.memberProfileId);
    const pendingDeactivations = await db.profileCorrectionRequest.findMany({
      where: {
        memberProfileId: { in: profileIds },
        field: 'MEMBERSHIP_DEACTIVATION',
        status: { in: ['PENDING', 'CLARIFICATION_REQUESTED'] },
      },
      select: { id: true, memberProfileId: true, reason: true },
    });
    const pendingDeactivationMap = new Map(pendingDeactivations.map((d) => [d.memberProfileId, d]));

    const members = memberships.map((m) => {
      const p = m.memberProfile;
      const pendingDeact = pendingDeactivationMap.get(p.id);
      return {
        id: m.id,
        profileId: p.id,
        membershipNumber: m.membershipNumber,
        fullName: p.fullName,
        email: p.email,
        phone: p.primaryPhone,
        memberCategory: p.memberCategory || 'OTHER',
        currentPosition: p.currentPosition || 'OTHER',
        occupation: p.occupation || '',
        companyName: p.companyName || '',
        businessSector: p.businessSector || 'General Enterprise',
        joinedDate: m.createdAt.toISOString(),
        status: m.status,
        hasPendingDeactivation: Boolean(pendingDeact),
        pendingDeactivationId: pendingDeact?.id || null,
        pendingDeactivationReason: pendingDeact?.reason || null,
        chapterId: m.chapterId,
        chapterName: m.chapter.name,
        chapterCode: m.chapter.code,
      };
    });

    return members.filter((member) => {
      if (filters?.category && filters.category !== 'ALL' && member.memberCategory !== filters.category) {
        return false;
      }
      if (filters?.position && filters.position !== 'ALL' && member.currentPosition !== filters.position) {
        return false;
      }
      if (filters?.status && filters.status !== 'ALL' && member.status !== filters.status) {
        return false;
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = member.fullName.toLowerCase().includes(q);
        const matchesId = member.membershipNumber.toLowerCase().includes(q);
        const matchesCompany = member.companyName.toLowerCase().includes(q);
        const matchesSector = member.businessSector.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesCompany && !matchesSector) return false;
      }
      return true;
    });
  }

  /**
   * Get chapter meetings and action items
   */
  static async getChapterMeetings(actor: AuthActor, chapterId: string) {
    assertAuthorized({
      actor,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId,
    });

    return await db.meeting.findMany({
      where: { chapterId },
      include: {
        minutes: true,
        actionItems: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Schedule a new chapter meeting
   */
  static async scheduleMeeting(actor: AuthActor, chapterId: string, input: ScheduleMeetingInput) {
    assertAuthorized({
      actor,
      action: 'chapter.update_settings',
      resource: 'chapter',
      chapterId,
    });

    if (!input.title || input.title.trim().length < 3) {
      throw new Error('Meeting title must be at least 3 characters.');
    }

    if (!input.venue || input.venue.trim().length < 3) {
      throw new Error('Venue location must be at least 3 characters.');
    }

    const scheduledDate = new Date(input.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error('Invalid meeting date or time.');
    }

    return await db.$transaction(async (tx) => {
      const meeting = await tx.meeting.create({
        data: {
          chapterId,
          title: input.title.trim(),
          type: input.type,
          scheduledAt: scheduledDate,
          venue: input.venue.trim(),
          agenda: input.agenda?.trim() || null,
        },
      });

      // If a coordinator name was provided, create an initial action item for organization
      if (input.coordinatorName && input.coordinatorName.trim()) {
        await tx.actionItem.create({
          data: {
            meetingId: meeting.id,
            title: `Coordinate meeting venue and quorum notices (${input.title.trim()})`,
            assigneeName: input.coordinatorName.trim(),
            dueDate: scheduledDate,
            status: 'PENDING',
          },
        });
      }

      await tx.auditEvent.create({
        data: {
          actorId: await resolveAuditActorId(tx, actor.userId),
          actorEmail: actor.email,
          chapterId,
          action: 'CHAPTER_MEETING_SCHEDULED',
          resource: 'Meeting',
          resourceId: meeting.id,
          diffJson: {
            title: input.title,
            type: input.type,
            scheduledAt: scheduledDate.toISOString(),
            venue: input.venue,
          },
        },
      });

      return meeting;
    });
  }

  /**
   * Update action item status
   */
  static async updateActionItemStatus(
    actor: AuthActor,
    chapterId: string,
    actionItemId: string,
    status: ActionItemStatus
  ) {
    assertAuthorized({
      actor,
      action: 'chapter.update_settings',
      resource: 'chapter',
      chapterId,
    });

    const actionItem = await db.actionItem.findUnique({
      where: { id: actionItemId },
      include: { meeting: true },
    });

    if (!actionItem || actionItem.meeting.chapterId !== chapterId) {
      throw new Error('Action item not found in this chapter.');
    }

    return await db.actionItem.update({
      where: { id: actionItemId },
      data: { status },
    });
  }

  /**
   * Record meeting minutes & decisions
   */
  static async recordMeetingMinutes(
    actor: AuthActor,
    chapterId: string,
    meetingId: string,
    summary: string,
    decisions: string
  ) {
    assertAuthorized({
      actor,
      action: 'chapter.update_settings',
      resource: 'chapter',
      chapterId,
    });

    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.chapterId !== chapterId) {
      throw new Error('Meeting not found in this chapter.');
    }

    return await db.meetingMinute.upsert({
      where: { meetingId },
      update: {
        summary,
        decisions,
      },
      create: {
        meetingId,
        recordedById: actor.userId,
        summary,
        decisions,
      },
    });
  }

  /**
   * Appoint chapter leadership role (President, Secretary, Treasurer)
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
    assertAuthorized({
      actor,
      action: 'chapter.manage_leadership',
      resource: 'chapter',
      chapterId,
    });

    return await db.$transaction(async (tx) => {
      // 1. Deactivate prior leader in this specific role and clean up their role assignments
      const priorLeaders = await tx.chapterLeadership.findMany({
        where: {
          chapterId,
          role,
          isActive: true,
        },
      });

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

      for (const prior of priorLeaders) {
        if (prior.userId !== targetUserId) {
          const priorRoleCode =
            prior.role === 'PRESIDENT'
              ? 'CHAPTER_PRESIDENT'
              : prior.role === 'SECRETARY'
              ? 'CHAPTER_SECRETARY'
              : prior.role === 'TREASURER'
              ? 'CHAPTER_TREASURER'
              : 'CHAPTER_COORDINATOR';

          const priorSysRole = await tx.role.findUnique({ where: { code: priorRoleCode } });
          if (priorSysRole) {
            await tx.userRoleAssignment.deleteMany({
              where: {
                userId: prior.userId,
                roleId: priorSysRole.id,
                chapterId,
              },
            });
          }
        }
      }

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

      let systemRole = await tx.role.findUnique({
        where: { code: roleCode },
      });

      if (!systemRole) {
        systemRole = await tx.role.create({
          data: {
            code: roleCode,
            name: roleCode.replace(/_/g, ' '),
            description: `Constituency Chapter ${role} Role`,
            isSystem: true,
          },
        });
      }

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
    }, {
      maxWait: 15000,
      timeout: 30000,
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
    assertAuthorized({
      actor,
      action: 'chapter.manage_leadership',
      resource: 'chapter',
      chapterId,
    });

    return await db.$transaction(async (tx) => {
      const appointment = await tx.chapterLeadership.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment || appointment.chapterId !== chapterId) {
        throw new Error('Leadership appointment not found in this chapter.');
      }

      const updated = await tx.chapterLeadership.update({
        where: { id: appointmentId },
        data: {
          isActive: false,
          endDate: new Date(),
        },
      });

      // Also clean up UserRoleAssignment
      const roleCode =
        appointment.role === 'PRESIDENT'
          ? 'CHAPTER_PRESIDENT'
          : appointment.role === 'SECRETARY'
          ? 'CHAPTER_SECRETARY'
          : appointment.role === 'TREASURER'
          ? 'CHAPTER_TREASURER'
          : 'CHAPTER_COORDINATOR';

      const systemRole = await tx.role.findUnique({ where: { code: roleCode } });
      if (systemRole) {
        await tx.userRoleAssignment.deleteMany({
          where: {
            userId: appointment.userId,
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
          action: 'LEADERSHIP_ROLE_REVOKED',
          resource: 'ChapterLeadership',
          resourceId: appointment.id,
          diffJson: { reason, previousRole: appointment.role, targetUserId: appointment.userId },
        },
      });

      return updated;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }
}
