import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getPortalScope,
  hasCentralSystemRole,
  getSessionCookieNameForScope,
  CENTRAL_SYSTEM_ROLES,
  SESSION_COOKIE_PUBLIC,
  SESSION_COOKIE_ADMIN,
} from '@/server/auth/portal-isolation';

describe('MYBF Dual-Port & Scope Isolation Architecture', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.MYBF_PORTAL_SCOPE;
    delete process.env.PORT;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('Central System Role Identification', () => {
    it('correctly includes SUPER_ADMIN and ORGANIZATION_ADMIN as central system roles', () => {
      expect(CENTRAL_SYSTEM_ROLES).toContain('SUPER_ADMIN');
      expect(CENTRAL_SYSTEM_ROLES).toContain('ORGANIZATION_ADMIN');
    });

    it('identifies users with SUPER_ADMIN as central system users', () => {
      expect(hasCentralSystemRole(['SUPER_ADMIN'])).toBe(true);
      expect(hasCentralSystemRole(['SUPER_ADMIN', 'MEMBER'])).toBe(true);
    });

    it('identifies users with ORGANIZATION_ADMIN as central system users', () => {
      expect(hasCentralSystemRole(['ORGANIZATION_ADMIN'])).toBe(true);
    });

    it('rejects regular members, chapter officers, and district admins from central system status', () => {
      expect(hasCentralSystemRole(['MEMBER'])).toBe(false);
      expect(hasCentralSystemRole(['CHAPTER_PRESIDENT', 'MEMBER'])).toBe(false);
      expect(hasCentralSystemRole(['CHAPTER_SECRETARY'])).toBe(false);
      expect(hasCentralSystemRole(['DISTRICT_ADMIN'])).toBe(false);
      expect(hasCentralSystemRole([])).toBe(false);
    });
  });

  describe('Portal Scope Detection via HTTP Headers', () => {
    it('detects Port 4000 host header as ADMIN portal scope', () => {
      const headers = new Headers({ host: 'localhost:4000' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects Port 4000 via x-forwarded-host header as ADMIN portal scope', () => {
      const headers = new Headers({
        host: 'internal-lb',
        'x-forwarded-host': 'admin.mybf.in:4000',
      });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects admin subdomain as ADMIN portal scope', () => {
      const headers = new Headers({ host: 'admin.mybf.in' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('detects Port 3000 host header as PUBLIC portal scope', () => {
      const headers = new Headers({ host: 'localhost:3000' });
      expect(getPortalScope(headers)).toBe('PUBLIC');
    });

    it('detects default production host (without port 4000) as PUBLIC portal scope', () => {
      const headers = new Headers({ host: 'mybf.in' });
      expect(getPortalScope(headers)).toBe('PUBLIC');
    });

    it('defaults to PUBLIC scope when no headers or host provided', () => {
      expect(getPortalScope(null)).toBe('PUBLIC');
      expect(getPortalScope(undefined)).toBe('PUBLIC');
    });
  });

  describe('Portal Scope Detection via Environment Overrides', () => {
    it('overrides to ADMIN scope when MYBF_PORTAL_SCOPE=admin', () => {
      process.env.MYBF_PORTAL_SCOPE = 'admin';
      const headers = new Headers({ host: 'localhost:3000' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });

    it('overrides to ADMIN scope when PORT=4000', () => {
      process.env.PORT = '4000';
      const headers = new Headers({ host: 'any-host' });
      expect(getPortalScope(headers)).toBe('ADMIN');
    });
  });

  describe('Session Cookie Isolation per Port', () => {
    it('returns dedicated admin session cookie for ADMIN portal scope', () => {
      expect(getSessionCookieNameForScope('ADMIN')).toBe(SESSION_COOKIE_ADMIN);
      expect(getSessionCookieNameForScope('ADMIN')).toBe('mybf_admin_session');
    });

    it('returns standard session cookie for PUBLIC portal scope', () => {
      expect(getSessionCookieNameForScope('PUBLIC')).toBe(SESSION_COOKIE_PUBLIC);
      expect(getSessionCookieNameForScope('PUBLIC')).toBe('mybf_session');
    });

    it('guarantees that public and admin session cookies have distinct names', () => {
      expect(SESSION_COOKIE_ADMIN).not.toBe(SESSION_COOKIE_PUBLIC);
    });
  });
});
