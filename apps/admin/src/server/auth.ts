import 'server-only';
import { getCurrentActor } from '@shared/server/auth/session';
import { SESSION_COOKIE_ADMIN } from '@shared/server/auth/portal-isolation';
import type { AuthActor } from '@shared/server/auth/types';

export const ADMIN_SESSION_COOKIE = SESSION_COOKIE_ADMIN;

export interface AdminActor extends AuthActor {
  id: string; // compatibility alias for userId
}

export async function getCurrentAdmin(): Promise<AdminActor | null> {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return null;
    }

    const isCentralAdmin =
      actor.roles.includes('SUPER_ADMIN') ||
      actor.roles.includes('ORGANIZATION_ADMIN');

    if (!isCentralAdmin) {
      return null;
    }

    return {
      ...actor,
      id: actor.userId,
    };
  } catch {
    return null;
  }
}

