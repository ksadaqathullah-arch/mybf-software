import 'server-only';
import { cookies } from 'next/headers';
import { db } from './db';

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
