import 'server-only';
import { db } from '@/server/db';
import type { AuthActor } from '@/server/auth/types';
import { TALUKS_OF_MALAPPURAM } from '@/features/geography/constants/malappuram-geo';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import type { Prisma } from '@prisma/client';

export interface DistrictOverviewMetrics {
  districtName: string;
  districtCode: string;
  totalDistrictMembers: number;
  totalRegisteredUsers: number;
  newRegistrationsThisMonth: number;
  pendingDistrictReviews: number;
  approvedMemberships: number;
  rejectedApplications: number;
  activeChaptersCount: number;
  totalChaptersCount: number;
  totalEventsCount: number;
  upcomingEventsCount: number;
  chapters: Array<{
    id: string;
    code: string;
    name: string;
    slug: string;
    taluk: string;
    activeMembersCount: number;
    pendingReviewsCount: number;
    status: string;
  }>;
  taluks: Array<{
    name: string;
    code: string;
    headquarters: string;
    memberCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    actorEmail: string | null;
    ipAddress: string | null;
    createdAt: string;
  }>;
}

export interface DistrictMemberQueryParams {
  search?: string;
  chapterSlug?: string;
  taluk?: string;
  category?: string;
  position?: string;
  status?: string;
  expectation?: string;
  talent?: string;
  participation?: string;
  page?: number;
  pageSize?: number;
}

export class DistrictAdminService {
  /**
   * Asserts actor has DISTRICT_ADMIN or SUPER_ADMIN role
   */
  static assertDistrictAdmin(actor: AuthActor) {
    if (!actor || actor.status !== 'ACTIVE') {
      const err = new Error('Unauthorized: Authentication required.');
      (err as any).statusCode = 401;
      throw err;
    }

    const hasDistrictAdmin = actor.roles.includes('DISTRICT_ADMIN');
    const hasSuperAdmin = actor.roles.includes('SUPER_ADMIN');

    if (!hasDistrictAdmin && !hasSuperAdmin) {
      const err = new Error('Forbidden: District Administrator credentials required.');
      (err as any).statusCode = 403;
      throw err;
    }
  }

  /**
   * Fast deny-by-default role authorization helper for Malappuram District Admin.
   */
  static isAuthorizedDistrictAdmin(actor: AuthActor | null | undefined): boolean {
    if (!actor || actor.status !== 'ACTIVE') return false;
    return actor.roles.includes('DISTRICT_ADMIN') || actor.roles.includes('SUPER_ADMIN');
  }

  /**
   * Resolves canonical Malappuram district with resilient code and name lookup
   */
  static async resolveDistrict() {
    const district = await db.district.findFirst({
      where: {
        OR: [
          { code: 'DIST-MALAPPURAM' },
          { code: 'MLP' },
          { name: { contains: 'Malappuram', mode: 'insensitive' } },
        ],
      },
    });
    if (!district) {
      const fallbackDistrict = await db.district.findFirst({
        where: { isActive: true },
      });
      if (fallbackDistrict) return fallbackDistrict;
      throw new Error('Canonical Malappuram district not found in database.');
    }
    return district;
  }

  /**
   * Live database-driven overview metrics for Malappuram district
   */
  static async getDistrictOverviewMetrics(actor: AuthActor): Promise<DistrictOverviewMetrics> {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeMembers,
      totalRegistered,
      newThisMonth,
      pendingReviews,
      approvedApps,
      rejectedApps,
      chaptersList,
      totalEvents,
      upcomingEvents,
      talukGroup,
      recentAuditLogs,
    ] = await Promise.all([
      db.membership.count({
        where: {
          chapter: { districtId: district.id },
          status: 'ACTIVE',
        },
      }),
      db.user.count({
        where: {
          profile: { chapter: { districtId: district.id } },
        },
      }),
      db.user.count({
        where: {
          createdAt: { gte: startOfMonth },
          profile: { chapter: { districtId: district.id } },
        },
      }),
      db.membershipApplication.count({
        where: {
          chapter: { districtId: district.id },
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
      db.membershipApplication.count({
        where: {
          chapter: { districtId: district.id },
          status: 'APPROVED',
        },
      }),
      db.membershipApplication.count({
        where: {
          chapter: { districtId: district.id },
          status: 'REJECTED',
        },
      }),
      db.chapter.findMany({
        where: { districtId: district.id },
        include: {
          _count: {
            select: {
              memberships: { where: { status: 'ACTIVE' } },
              membershipApplications: { where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } },
            },
          },
        },
        orderBy: { code: 'asc' },
      }),
      db.event.count({
        where: {
          OR: [{ chapter: { districtId: district.id } }, { chapterId: null }],
        },
      }),
      db.event.count({
        where: {
          startsAt: { gte: now },
          OR: [{ chapter: { districtId: district.id } }, { chapterId: null }],
        },
      }),
      db.memberProfile.groupBy({
        by: ['taluk'],
        where: {
          chapter: { districtId: district.id },
          taluk: { not: null },
        },
        _count: { id: true },
      }),
      db.auditEvent.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          resource: true,
          actorEmail: true,
          ipAddress: true,
          createdAt: true,
        },
      }),
    ]);

    // Build chapter breakdown with taluk mapping from founding constants
    const talukMapping = new Map(INITIAL_16_CHAPTERS.map((c) => [c.code, c.taluk]));

    const formattedChapters = chaptersList.map((ch) => ({
      id: ch.id,
      code: ch.code,
      name: ch.name,
      slug: ch.slug,
      taluk: talukMapping.get(ch.code) || 'Malappuram',
      activeMembersCount: ch._count.memberships,
      pendingReviewsCount: ch._count.membershipApplications,
      status: ch.status,
    }));

    // Map taluks to live counts
    const talukCountMap = new Map<string, number>();
    talukGroup.forEach((g) => {
      if (g.taluk) talukCountMap.set(g.taluk.toLowerCase(), g._count.id);
    });

    const formattedTaluks = TALUKS_OF_MALAPPURAM.map((t) => ({
      name: t.name,
      code: t.code,
      headquarters: t.headquarters,
      memberCount: talukCountMap.get(t.name.toLowerCase()) || 0,
    }));

    return {
      districtName: district.name,
      districtCode: district.code,
      totalDistrictMembers: activeMembers,
      totalRegisteredUsers: totalRegistered,
      newRegistrationsThisMonth: newThisMonth,
      pendingDistrictReviews: pendingReviews,
      approvedMemberships: approvedApps,
      rejectedApplications: rejectedApps,
      activeChaptersCount: chaptersList.filter((c) => c.status === 'ACTIVE').length,
      totalChaptersCount: chaptersList.length,
      totalEventsCount: totalEvents,
      upcomingEventsCount: upcomingEvents,
      chapters: formattedChapters,
      taluks: formattedTaluks,
      recentActivity: recentAuditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        resource: l.resource,
        actorEmail: l.actorEmail || 'System',
        ipAddress: l.ipAddress || 'Internal',
        createdAt: l.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Detailed 16 Chapters Governance data for District Admin
   */
  static async getDistrictChapters(actor: AuthActor) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const chapters = await db.chapter.findMany({
      where: { districtId: district.id },
      include: {
        leadership: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
                profile: {
                  select: { fullName: true, primaryPhone: true },
                },
              },
            },
          },
        },
        _count: {
          select: {
            memberships: { where: { status: 'ACTIVE' } },
            membershipApplications: { where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } },
            events: true,
            meetings: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const talukMap = new Map(INITIAL_16_CHAPTERS.map((c) => [c.code, c.taluk]));

    return chapters.map((ch) => ({
      id: ch.id,
      code: ch.code,
      name: ch.name,
      slug: ch.slug,
      status: ch.status,
      taluk: talukMap.get(ch.code) || 'Malappuram',
      activeMembersCount: ch._count.memberships,
      pendingApplicationsCount: ch._count.membershipApplications,
      eventsCount: ch._count.events,
      meetingsCount: ch._count.meetings,
      leadership: ch.leadership.map((l) => ({
        id: l.id,
        role: l.role as string,
        title: l.title,
        fullName: l.user.profile?.fullName || l.user.username || l.user.email || 'Appointed Officer',
        email: l.user.email || '',
        phone: l.user.profile?.primaryPhone || null,
        startDate: l.startDate.toISOString(),
      })),
    }));
  }

  /**
   * Paginated District Members Directory query with multi-dimensional filtering
   */
  static async getDistrictMembers(actor: AuthActor, params: DistrictMemberQueryParams) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(10, params.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.MembershipWhereInput = {
      chapter: { districtId: district.id },
    };

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as any;
    }

    if (params.chapterSlug && params.chapterSlug !== 'ALL') {
      where.chapter = { slug: params.chapterSlug, districtId: district.id };
    }

    const profileWhere: Prisma.MemberProfileWhereInput = {};

    if (params.taluk && params.taluk !== 'ALL') {
      profileWhere.taluk = params.taluk;
    }

    if (params.category && params.category !== 'ALL') {
      profileWhere.memberCategory = params.category as any;
    }

    if (params.position && params.position !== 'ALL') {
      profileWhere.currentPosition = params.position as any;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { membershipNumber: { contains: q, mode: 'insensitive' } },
        { memberProfile: { fullName: { contains: q, mode: 'insensitive' } } },
        { memberProfile: { email: { contains: q, mode: 'insensitive' } } },
        { memberProfile: { primaryPhone: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (params.expectation && params.expectation !== 'ALL') {
      profileWhere.expectations = {
        some: { expectationKey: params.expectation },
      };
    }

    if (params.talent && params.talent !== 'ALL') {
      profileWhere.talents = {
        some: { talentKey: params.talent },
      };
    }

    if (params.participation && params.participation !== 'ALL') {
      profileWhere.participationPreferences = {
        some: { preferenceKey: params.participation },
      };
    }

    if (Object.keys(profileWhere).length > 0) {
      where.memberProfile = profileWhere;
    }

    const [total, memberships] = await Promise.all([
      db.membership.count({ where }),
      db.membership.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          chapter: { select: { id: true, code: true, name: true, slug: true } },
          memberProfile: {
            include: {
              expectations: true,
              talents: true,
              participationPreferences: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const talukMap = new Map(INITIAL_16_CHAPTERS.map((c) => [c.code, c.taluk]));

    const members = memberships.map((m) => ({
      id: m.id,
      membershipNumber: m.membershipNumber,
      fullName: m.memberProfile?.fullName || 'MYBF Member',
      email: m.memberProfile?.email || '',
      phone: m.memberProfile?.primaryPhone || '',
      chapterName: m.chapter?.name || 'Malappuram Chapter',
      chapterCode: m.chapter?.code || 'CHP-00',
      chapterSlug: m.chapter?.slug || 'chapter',
      taluk: m.memberProfile?.taluk || talukMap.get(m.chapter?.code || '') || 'Malappuram',
      memberCategory: m.memberProfile?.memberCategory,
      currentPosition: m.memberProfile?.currentPosition,
      occupation: m.memberProfile?.occupation,
      companyName: m.memberProfile?.companyName,
      status: m.status,
      joinedDate: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
      expectations: m.memberProfile?.expectations?.map((e) => e.expectationKey) || [],
      talents: m.memberProfile?.talents?.map((t) => t.talentKey) || [],
      participationPreferences: m.memberProfile?.participationPreferences?.map((p) => p.preferenceKey) || [],
    }));

    return {
      members,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * District Membership Applications Review Queue (read-only monitoring & review)
   */
  static async getDistrictApplications(
    actor: AuthActor,
    filters?: {
      chapterId?: string;
      status?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    }
  ) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const page = Math.max(1, filters?.page || 1);
    const pageSize = Math.min(100, Math.max(10, filters?.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.MembershipApplicationWhereInput = {
      chapter: { districtId: district.id },
    };

    if (filters?.chapterId && filters.chapterId !== 'ALL') {
      where.chapterId = filters.chapterId;
    }

    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as any;
    }

    if (filters?.search && filters.search.trim()) {
      where.user = {
        OR: [
          { email: { contains: filters.search.trim(), mode: 'insensitive' } },
          { username: { contains: filters.search.trim(), mode: 'insensitive' } },
          { profile: { fullName: { contains: filters.search.trim(), mode: 'insensitive' } } },
        ],
      };
    }

    const [total, applications] = await Promise.all([
      db.membershipApplication.count({ where }),
      db.membershipApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          chapter: { select: { id: true, code: true, name: true, slug: true } },
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              profile: {
                select: {
                  fullName: true,
                  primaryPhone: true,
                  memberCategory: true,
                  currentPosition: true,
                  dateOfBirth: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      applications: applications.map((app) => ({
        id: app.id,
        status: app.status,
        submittedAt: app.createdAt.toISOString(),
        chapterName: app.chapter.name,
        chapterCode: app.chapter.code,
        chapterSlug: app.chapter.slug,
        reviewNotes: app.reviewNotes,
        rejectionReason: app.rejectionReason,
        applicant: {
          userId: app.user.id,
          fullName: app.user.profile?.fullName || app.user.username || app.user.email || 'Applicant',
          email: app.user.email,
          phone: app.user.profile?.primaryPhone,
          memberCategory: app.user.profile?.memberCategory,
          currentPosition: app.user.profile?.currentPosition,
          dateOfBirth: app.user.profile?.dateOfBirth ? app.user.profile.dateOfBirth.toISOString() : null,
        },
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * District Events & Activities
   */
  static async getDistrictEvents(actor: AuthActor) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const events = await db.event.findMany({
      where: {
        OR: [{ chapter: { districtId: district.id } }, { chapterId: null }],
      },
      include: {
        chapter: { select: { id: true, code: true, name: true, slug: true } },
      },
      orderBy: { startsAt: 'desc' },
    });

    return events.map((e) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      category: e.category,
      description: e.description,
      venueName: e.venueName,
      venueAddress: e.venueAddress,
      eventType: e.eventType,
      basePriceINR: e.basePriceINR,
      capacity: e.capacity,
      registeredCount: e.registeredCount,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      status: e.status,
      chapter: e.chapter,
    }));
  }

  /**
   * District Finance & Sponsorship Reporting (100% Free NGO Model)
   */
  static async getDistrictFinance(actor: AuthActor) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const [events, chaptersCount] = await Promise.all([
      db.event.findMany({
        where: {
          OR: [{ chapter: { districtId: district.id } }, { chapterId: null }],
        },
        select: {
          id: true,
          title: true,
          eventType: true,
          basePriceINR: true,
          registeredCount: true,
          startsAt: true,
        },
      }),
      db.chapter.count({ where: { districtId: district.id } }),
    ]);

    return {
      membershipPolicy: {
        isFree: true,
        policyStatement: '100% Free Membership Policy. MYBF charges zero membership fees and zero annual dues.',
        collectedMembershipFees: 0,
      },
      districtSummary: {
        districtName: district.name,
        districtCode: district.code,
        totalChapters: chaptersCount,
        totalEventsTracked: events.length,
      },
      recentEvents: events.map((e) => ({
        id: e.id,
        title: e.title,
        eventType: e.eventType,
        basePriceINR: e.basePriceINR,
        registeredCount: e.registeredCount,
        startsAt: e.startsAt.toISOString(),
      })),
    };
  }

  /**
   * Records district-level review notes / recommendation for a membership application.
   * District Admin can monitor and add notes, but FINAL APPROVAL remains strictly under Super Admin.
   */
  static async recordDistrictReviewNote(actor: AuthActor, applicationId: string, notes: string) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const application = await db.membershipApplication.findFirst({
      where: {
        id: applicationId,
        chapter: { districtId: district.id },
      },
      include: {
        user: { select: { email: true, username: true } },
        chapter: { select: { id: true, name: true, organizationId: true } },
      },
    });

    if (!application) {
      const err = new Error('Application not found within district scope.');
      (err as any).statusCode = 404;
      throw err;
    }

    const updated = await db.membershipApplication.update({
      where: { id: applicationId },
      data: {
        reviewNotes: notes.trim(),
      },
    });

    await db.auditEvent.create({
      data: {
        actorId: actor.userId,
        actorEmail: actor.email,
        action: 'DISTRICT_ADMIN_APPLICATION_REVIEWED',
        resource: 'MembershipApplication',
        resourceId: applicationId,
        organizationId: application.chapter.organizationId,
        chapterId: application.chapter.id,
        diffJson: {
          applicationId,
          applicantEmail: application.user.email,
          chapterName: application.chapter.name,
          notes: notes.trim(),
        },
      },
    });

    return updated;
  }

  /**
   * Detailed Growth Analytics and Aggregations for District Admin Reports
   */
  static async getDistrictAnalytics(actor: AuthActor) {
    this.assertDistrictAdmin(actor);
    const district = await this.resolveDistrict();

    const [
      categoryGroups,
      positionGroups,
      chapterMemberships,
      userRegistrations,
      totalActiveMembers,
      totalPendingApplications,
      totalApprovedApplications,
    ] = await Promise.all([
      db.memberProfile.groupBy({
        by: ['memberCategory'],
        where: { chapter: { districtId: district.id } },
        _count: { id: true },
      }),
      db.memberProfile.groupBy({
        by: ['currentPosition'],
        where: { chapter: { districtId: district.id } },
        _count: { id: true },
      }),
      db.chapter.findMany({
        where: { districtId: district.id },
        include: {
          _count: {
            select: {
              memberships: { where: { status: 'ACTIVE' } },
              membershipApplications: { where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } },
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.user.findMany({
        where: { profile: { chapter: { districtId: district.id } } },
        select: { createdAt: true },
      }),
      db.membership.count({
        where: { chapter: { districtId: district.id }, status: 'ACTIVE' },
      }),
      db.membershipApplication.count({
        where: { chapter: { districtId: district.id }, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      db.membershipApplication.count({
        where: { chapter: { districtId: district.id }, status: 'APPROVED' },
      }),
    ]);

    // Aggregate registrations by month
    const monthCounts: Record<string, number> = {};
    userRegistrations.forEach((u) => {
      const monthKey = u.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    const monthlyTimeline = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      districtName: district.name,
      districtCode: district.code,
      totalActiveMembers,
      totalPendingApplications,
      totalApprovedApplications,
      categoryDistribution: categoryGroups.map((g) => ({
        category: g.memberCategory || 'UNCLASSIFIED',
        count: g._count.id,
      })),
      positionDistribution: positionGroups.map((g) => ({
        position: g.currentPosition || 'UNCLASSIFIED',
        count: g._count.id,
      })),
      chapterComparisons: chapterMemberships.map((c) => ({
        code: c.code,
        name: c.name,
        slug: c.slug,
        activeMembers: c._count.memberships,
        pendingReviews: c._count.membershipApplications,
      })),
      monthlyTimeline,
    };
  }
}


