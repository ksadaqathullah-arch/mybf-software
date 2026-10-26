import 'server-only';
import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { db } from '@/server/db';
import type { AuthActor, SystemRoleCode } from './types';
import {
  getPortalScope,
  getSessionCookieNameForScope,
  SESSION_COOKIE_PUBLIC,
  SESSION_COOKIE_ADMIN,
} from './portal-isolation';

export const SESSION_COOKIE_NAME = SESSION_COOKIE_PUBLIC;
export const SESSION_COOKIE_ADMIN_NAME = SESSION_COOKIE_ADMIN;
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days


/**
 * Creates a persistent database session for the given user.
 */
export async function createSession(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  return sessionToken;
}

/**
 * Resolves an AuthActor from a session token.
 * Returns null if session is invalid, expired, or user is not active.
 */
export async function getSessionActor(sessionToken: string): Promise<AuthActor | null> {
  if (!sessionToken || sessionToken.length < 32) return null;

  const session = await db.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          profile: true,
          roleAssignments: {
            include: { role: true },
          },
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const user = session.user;
  if (user.status !== 'ACTIVE') {
    return null;
  }
  const now = new Date();

  // 1. Filter active, unexpired role assignments
  const activeRoleAssignments = user.roleAssignments.filter(
    (ra) => !ra.expiresAt || ra.expiresAt > now
  );

  // 2. Query active, unexpired chapter leadership appointments
  const activeLeadership = await db.chapterLeadership.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gt: now } }],
    },
    include: { chapter: true },
  });

  const leadershipRoles: SystemRoleCode[] = [];
  if (activeLeadership) {
    switch (activeLeadership.role) {
      case 'PRESIDENT':
        leadershipRoles.push('CHAPTER_PRESIDENT');
        break;
      case 'SECRETARY':
        leadershipRoles.push('CHAPTER_SECRETARY');
        break;
      case 'TREASURER':
        leadershipRoles.push('CHAPTER_TREASURER');
        break;
      default:
        leadershipRoles.push('CHAPTER_COORDINATOR');
        break;
    }
  }

  const assignedRoles = activeRoleAssignments.map((ra) => ra.role.code as SystemRoleCode);
  const combinedRoles = Array.from(new Set([...assignedRoles, ...leadershipRoles]));

  // Prioritize chapterId from leadership or officer assignment over standard member chapter
  const officerAssignment = activeRoleAssignments.find((ra) =>
    ra.chapterId && ra.role.code.startsWith('CHAPTER_')
  );

  const effectiveChapterId =
    activeLeadership?.chapterId ??
    officerAssignment?.chapterId ??
    activeRoleAssignments[0]?.chapterId ??
    user.profile?.chapterId ??
    null;

  const primaryAssignment = activeRoleAssignments[0];

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status as AuthActor['status'],
    roles: combinedRoles.length > 0 ? combinedRoles : ['MEMBER'],
    organizationId: primaryAssignment?.organizationId ?? user.profile?.organizationId ?? null,
    chapterId: effectiveChapterId,
    districtId: primaryAssignment?.districtId ?? null,
    memberProfileId: user.profile?.id ?? null,
  };
}

/**
 * Helper to get the current actor from Next.js cookies.
 * Dispatches to the port-isolated cookie (mybf_admin_session on Port 4000 / admin subdomain, mybf_session on Port 3000).
 */
export async function getCurrentActor(): Promise<AuthActor | null> {
  try {
    const cookieStore = await cookies();
    let token: string | undefined;

    try {
      const reqHeaders = await headers();
      const scope = getPortalScope(reqHeaders);
      const cookieName = getSessionCookieNameForScope(scope);
      token = cookieStore.get(cookieName)?.value;

      // In admin scope (Port 4000 / admin subdomain), strictly never fall back to public session
      if (!token && scope === 'ADMIN') {
        return null;
      }

      // If in public scope and no public session cookie exists, check if an admin session is active
      if (!token && scope === 'PUBLIC') {
        token = cookieStore.get(SESSION_COOKIE_ADMIN_NAME)?.value;
      }
    } catch {
      token = cookieStore.get(SESSION_COOKIE_ADMIN_NAME)?.value || cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!token) return null;
    return await getSessionActor(token);
  } catch {
    return null;
  }
}

/**
 * Destroys a session in the database.
 */
export async function destroySession(sessionToken: string): Promise<void> {
  if (!sessionToken) return;
  await db.session.deleteMany({
    where: { sessionToken },
  });
}
