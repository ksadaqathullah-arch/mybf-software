import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getPortalScope,
  hasCentralSystemRole,
  getSessionCookieNameForScope,
  CENTRAL_SYSTEM_ROLES,
  SESSION_COOKIE_PUBLIC,
  SESSION_COOKIE_ADMIN,
} from '@/server/auth/portal-isolation';

describe('Super Admin Portal Scope & Auth Isolation Unit Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MYBF_PORTAL_SCOPE;
    delete process.env.PORT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Portal Scope Detection for Vercel Production & Custom Domains', () => {
    it('accurately detects production Vercel admin URL (mybf-admin.vercel.app) as ADMIN scope', () => {
      const headers = new Headers({ host: 'mybf-admin.vercel.app' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('accurately detects x-forwarded-host for mybf-admin.vercel.app as ADMIN scope', () => {
      const headers = new Headers({
        host: 'vercel-gateway.internal',
        'x-forwarded-host': 'mybf-admin.vercel.app',
      });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects standard custom admin domain (admin.mybf.in) as ADMIN scope', () => {
      const headers = new Headers({ host: 'admin.mybf.in' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects alternative admin deployment URL (admin-mybf.vercel.app) as ADMIN scope', () => {
      const headers = new Headers({ host: 'admin-mybf.vercel.app' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects local dev admin server (localhost:4000) as ADMIN scope', () => {
      const headers = new Headers({ host: 'localhost:4000' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects public portal production URL (mybf.in) as PUBLIC scope', () => {
      const headers = new Headers({ host: 'mybf.in' });
      expect(getPortalScope(headers)).toBe('PUBLIC');
    });

    it('detects public portal local dev server (localhost:3000) as PUBLIC scope', () => {
      const headers = new Headers({ host: 'localhost:3000' });
      expect(getPortalScope(headers)).toBe('PUBLIC');
    });

    it('detects non-admin vercel deployment (mybf-portal.vercel.app) as PUBLIC scope', () => {
      const headers = new Headers({ host: 'mybf-portal.vercel.app' });
      expect(getPortalScope(headers)).toBe('PUBLIC');
    });

    it('honors MYBF_PORTAL_SCOPE=admin environment variable deterministic override', () => {
      process.env.MYBF_PORTAL_SCOPE = 'admin';
      const headers = new Headers({ host: 'localhost:3000' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('honors PORT=4000 environment variable override', () => {
      process.env.PORT = '4000';
      const headers = new Headers({ host: 'any-origin.internal' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });
  });

  describe('Session Cookie Isolation per Scope', () => {
    it('uses dedicated mybf_admin_session cookie for ADMIN portal scope', () => {
      expect(getSessionCookieNameForScope('ADMIN')).toBe('mybf_admin_session');
      expect(getSessionCookieNameForScope('ADMIN')).toBe(SESSION_COOKIE_ADMIN);
    });

    it('uses standard mybf_session cookie for PUBLIC portal scope', () => {
      expect(getSessionCookieNameForScope('PUBLIC')).toBe('mybf_session');
      expect(getSessionCookieNameForScope('PUBLIC')).toBe(SESSION_COOKIE_PUBLIC);
    });

    it('guarantees that public and admin cookie keys never collide', () => {
      expect(SESSION_COOKIE_ADMIN).not.toBe(SESSION_COOKIE_PUBLIC);
    });
  });

  describe('Role Authorization Matrix & Central System Privileges', () => {
    it('grants central admin privileges strictly to SUPER_ADMIN and ORGANIZATION_ADMIN', () => {
      expect(CENTRAL_SYSTEM_ROLES).toEqual(['SUPER_ADMIN', 'ORGANIZATION_ADMIN']);
      expect(hasCentralSystemRole(['SUPER_ADMIN'])).toBe(true);
      expect(hasCentralSystemRole(['ORGANIZATION_ADMIN'])).toBe(true);
      expect(hasCentralSystemRole(['SUPER_ADMIN', 'MEMBER'])).toBe(true);
    });

    it('denies central admin privileges to all other roles (Deny-by-Default)', () => {
      expect(hasCentralSystemRole(['MEMBER'])).toBe(false);
      expect(hasCentralSystemRole(['DISTRICT_ADMIN'])).toBe(false);
      expect(hasCentralSystemRole(['CHAPTER_PRESIDENT'])).toBe(false);
      expect(hasCentralSystemRole(['CHAPTER_SECRETARY'])).toBe(false);
      expect(hasCentralSystemRole(['CHAPTER_TREASURER'])).toBe(false);
      expect(hasCentralSystemRole([])).toBe(false);
    });
  });
});
