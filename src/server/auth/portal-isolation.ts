/**
 * MYBF Platform - Portal Port & Scope Isolation System
 * 
 * Enforces strict zero-trust separation between:
 * - Public & Member/Chapter Platform (Default: Port 3000)
 * - Central System & Super Administrator Workspace (Default: Port 4000)
 */

export type PortalScope = 'PUBLIC' | 'ADMIN';

export const PUBLIC_DEFAULT_PORT = 3000;
export const ADMIN_DEFAULT_PORT = 4000;

export const SESSION_COOKIE_PUBLIC = 'mybf_session';
export const SESSION_COOKIE_ADMIN = 'mybf_admin_session';

/**
 * Roles classified as Central System Users restricted to the dedicated admin port (Port 4000).
 */
export const CENTRAL_SYSTEM_ROLES = ['SUPER_ADMIN', 'ORGANIZATION_ADMIN'] as const;

export type CentralSystemRole = typeof CENTRAL_SYSTEM_ROLES[number];

/**
 * Evaluates whether a set of user roles includes any Central System administrative privilege.
 */
export function hasCentralSystemRole(roles: string[] = []): boolean {
  return roles.some((r) => (CENTRAL_SYSTEM_ROLES as readonly string[]).includes(r));
}

/**
 * Determines whether a request belongs to the Admin Portal (Port 4000) or Public/Member Portal (Port 3000).
 * Checks process environment and incoming HTTP Host / X-Forwarded-Host headers.
 */
export function getPortalScope(headersOrHost?: Headers | Record<string, string | string[] | undefined> | string | null): PortalScope {
  // 1. Explicit process-level override
  if (process.env.MYBF_PORTAL_SCOPE === 'admin' || process.env.PORT === '4000') {
    return 'ADMIN';
  }

  // 2. Host-based detection from HTTP headers
  if (headersOrHost) {
    let hostStr = '';
    if (typeof headersOrHost === 'string') {
      hostStr = headersOrHost;
    } else if (headersOrHost instanceof Headers) {
      hostStr = headersOrHost.get('x-forwarded-host') || headersOrHost.get('host') || '';
    } else if (typeof headersOrHost === 'object') {
      const h = headersOrHost['x-forwarded-host'] || headersOrHost['host'];
      hostStr = Array.isArray(h) ? h[0] : (h || '');
    }

    if (hostStr) {
      // Port 4000 match (e.g. localhost:4000 or 127.0.0.1:4000 or custom host:4000)
      if (hostStr.includes(':4000') || hostStr.startsWith('admin.') || hostStr.includes('admin-mybf')) {
        return 'ADMIN';
      }
    }
  }

  return 'PUBLIC';
}

/**
 * Returns the corresponding cookie name depending on the active portal scope.
 */
export function getSessionCookieNameForScope(scope: PortalScope): string {
  return scope === 'ADMIN' ? SESSION_COOKIE_ADMIN : SESSION_COOKIE_PUBLIC;
}
