import { describe, it, expect } from 'vitest';
import { authorize } from '@/server/auth/policy';
import { AuthActor } from '@/server/auth/types';

describe('Server Authorization Engine (Deny-By-Default)', () => {
  it('strictly denies unauthenticated or inactive actors', () => {
    const unauthResult = authorize({
      actor: null,
      action: 'member.approve_application',
      resource: 'membership_application',
    });
    expect(unauthResult.allowed).toBe(false);

    const inactiveActor: AuthActor = {
      userId: 'user-1',
      email: 'inactive@mybf.in',
      phone: '9847000000',
      status: 'SUSPENDED',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: 'manjeri-id',
    };

    const inactiveResult = authorize({
      actor: inactiveActor,
      action: 'member.approve_application',
      resource: 'membership_application',
      chapterId: 'manjeri-id',
    });
    expect(inactiveResult.allowed).toBe(false);
  });

  it('enforces strict chapter-level isolation for chapter officers', () => {
    const manjeriPresident: AuthActor = {
      userId: 'user-pres-manjeri',
      email: 'pres.manjeri@mybf.in',
      phone: '9847111111',
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: 'ch-manjeri',
      organizationId: 'org-mybf',
    };

    // Allowed for own chapter
    const ownChapterResult = authorize({
      actor: manjeriPresident,
      action: 'member.approve_application',
      resource: 'membership_application',
      chapterId: 'ch-manjeri',
      organizationId: 'org-mybf',
    });
    expect(ownChapterResult.allowed).toBe(true);
    expect(ownChapterResult.evaluatedScope).toBe('CHAPTER');

    // Denied for cross-chapter access (e.g. Tirur chapter)
    const crossChapterResult = authorize({
      actor: manjeriPresident,
      action: 'member.approve_application',
      resource: 'membership_application',
      chapterId: 'ch-tirur',
      organizationId: 'org-mybf',
    });
    expect(crossChapterResult.allowed).toBe(false);
    expect(crossChapterResult.reason).toContain('Cross-chapter access violation');
  });

  it('allows District Admin to view across chapters within the district', () => {
    const districtAdmin: AuthActor = {
      userId: 'user-dist-admin',
      email: 'district.lead@mybf.in',
      phone: '9847222222',
      status: 'ACTIVE',
      roles: ['DISTRICT_ADMIN'],
      organizationId: 'org-mybf',
      districtId: 'dist-malappuram',
    };

    const result = authorize({
      actor: districtAdmin,
      action: 'member.read_chapter',
      resource: 'chapter',
      organizationId: 'org-mybf',
      chapterId: 'ch-ponnani',
    });

    expect(result.allowed).toBe(true);
    expect(result.evaluatedScope).toBe('DISTRICT');
  });

  it('allows Super Admin global scope with audit readiness', () => {
    const superAdmin: AuthActor = {
      userId: 'user-super-admin',
      email: 'root@mybf.in',
      phone: '9847333333',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
    };

    const result = authorize({
      actor: superAdmin,
      action: 'admin.system_config',
      resource: 'system_config',
    });

    expect(result.allowed).toBe(true);
    expect(result.evaluatedScope).toBe('GLOBAL');
  });
});
