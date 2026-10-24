import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { db } from './db';
import type { AuthActor, SystemRoleCode } from './types';

export const ADMIN_SESSION_COOKIE = 'mybf_admin_session';

export interface AdminActor {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
}

export async function getCurrentAdmin(): Promise<AdminActor | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || cookieStore.get('mybf_session')?.value;
    if (!token || token.length < 32) return null;

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            roleAssignments: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const user = session.user;
    if (user.status !== 'ACTIVE') return null;

    const roles = user.roleAssignments
      .filter((ra) => !ra.expiresAt || ra.expiresAt > new Date())
      .map((ra) => ra.role.code);

    const isCentralAdmin = roles.includes('SUPER_ADMIN') || roles.includes('ORGANIZATION_ADMIN');
    if (!isCentralAdmin) return null;

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles,
    };
  } catch {
    return null;
  }
}

export async function getCurrentActor(): Promise<AuthActor | null> {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  return {
    userId: admin.id,
    email: admin.email,
    phone: admin.phone,
    status: admin.status as any,
    roles: admin.roles as SystemRoleCode[],
  };
}

export async function authenticateAdminUser(identifier: string, password: string) {
  const cleanId = identifier.trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');
  const phoneCandidates: string[] = [cleanId];
  if (digitsOnly.length === 10) {
    phoneCandidates.push(digitsOnly);
    phoneCandidates.push(`+91${digitsOnly}`);
    phoneCandidates.push(`91${digitsOnly}`);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const tenDigits = digitsOnly.slice(2);
    phoneCandidates.push(tenDigits);
    phoneCandidates.push(`+91${tenDigits}`);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const tenDigits = digitsOnly.slice(1);
    phoneCandidates.push(tenDigits);
    phoneCandidates.push(`+91${tenDigits}`);
  }

  const targetUser = await db.user.findFirst({
    where: {
      OR: [
        { username: { equals: cleanId, mode: 'insensitive' } },
        { email: { equals: cleanId, mode: 'insensitive' } },
        { phone: { in: phoneCandidates } },
        { profile: { primaryPhone: { in: phoneCandidates } } },
      ],
    },
    include: {
      profile: true,
      roleAssignments: { include: { role: true } },
    },
  });

  if (!targetUser) {
    throw new Error('Invalid username/email or password.');
  }

  if (!targetUser.passwordHash) {
    throw new Error('Invalid username/email or password.');
  }

  const parts = targetUser.passwordHash.split('$');
  let isValid = false;

  if (parts.length === 3 && parts[0] === 'scrypt') {
    const salt = parts[1];
    const originalHash = parts[2];
    const derivedKey = crypto.scryptSync(password, salt, 64);
    isValid = derivedKey.toString('hex') === originalHash;
  } else {
    isValid = targetUser.passwordHash === password;
  }

  if (!isValid) {
    throw new Error('Invalid username/email or password.');
  }

  if (targetUser.status !== 'ACTIVE') {
    throw new Error(`Your account is currently ${String(targetUser.status).toLowerCase()}. Please contact administration.`);
  }

  const roles = targetUser.roleAssignments
    .filter((ra) => !ra.expiresAt || ra.expiresAt > new Date())
    .map((ra) => ra.role.code);

  return {
    id: targetUser.id,
    email: targetUser.email,
    phone: targetUser.phone,
    username: targetUser.username,
    status: targetUser.status,
    roles,
  };
}
