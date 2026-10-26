import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getMainAppBaseUrl, getChapterHubUrl } from '@/lib/main-app-url';
import { INITIAL_16_CHAPTERS } from '@/features/chapters/constants/founding-chapters';
import { authorize } from '@/server/auth/policy';
import type { AuthActor } from '@/server/auth/types';

describe('Super Admin to Chapter Hub Cross-Domain Link Resolution', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('resolves main application base URL from NEXT_PUBLIC_MAIN_APP_URL when configured', () => {
    process.env.NEXT_PUBLIC_MAIN_APP_URL = 'https://mybf-software.vercel.app';
    const baseUrl = getMainAppBaseUrl();
    expect(baseUrl).toBe('https://mybf-software.vercel.app');
  });

  it('normalizes trailing slashes in configured environment URL', () => {
    process.env.NEXT_PUBLIC_MAIN_APP_URL = 'https://mybf-software.vercel.app///';
    const baseUrl = getMainAppBaseUrl();
    expect(baseUrl).toBe('https://mybf-software.vercel.app');
  });

  it('falls back to https://mybf-software.vercel.app in production default', () => {
    delete process.env.NEXT_PUBLIC_MAIN_APP_URL;
    delete process.env.NEXT_PUBLIC_PUBLIC_APP_URL;
    const baseUrl = getMainAppBaseUrl();
    expect(baseUrl).toBe('https://mybf-software.vercel.app');
  });

  it('generates correct Chapter Hub destination for Manjeri Chapter', () => {
    process.env.NEXT_PUBLIC_MAIN_APP_URL = 'https://mybf-software.vercel.app';
    const manjeriUrl = getChapterHubUrl('manjeri');
    expect(manjeriUrl).toBe('https://mybf-software.vercel.app/chapter/manjeri');
  });

  it('generates correct Chapter Hub destination for Kondotty Chapter', () => {
    process.env.NEXT_PUBLIC_MAIN_APP_URL = 'https://mybf-software.vercel.app';
    const kondottyUrl = getChapterHubUrl('kondotty');
    expect(kondottyUrl).toBe('https://mybf-software.vercel.app/chapter/kondotty');
  });

  it('generates valid, distinct destinations across all 16 Assembly Constituency Chapters without 404 admin paths', () => {
    process.env.NEXT_PUBLIC_MAIN_APP_URL = 'https://mybf-software.vercel.app';
    const urls = INITIAL_16_CHAPTERS.map((ch) => getChapterHubUrl(ch.slug));

    expect(urls).toHaveLength(16);
    // Ensure all urls belong to the main app domain and never the admin domain
    urls.forEach((url, i) => {
      const chapter = INITIAL_16_CHAPTERS[i];
      expect(url).toBe(`https://mybf-software.vercel.app/chapter/${chapter.slug}`);
      expect(url).not.toContain('mybf-admin.vercel.app');
    });

    // Ensure all 16 destinations are unique
    expect(new Set(urls).size).toBe(16);
  });

  it('enforces RBAC: Super Admin has global oversight access to Chapter Executive Hubs', () => {
    const superAdmin: AuthActor = {
      userId: 'sa-001',
      email: 'superadmin@mybf.in',
      phone: null,
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
    };

    const manjeriAccess = authorize({
      actor: superAdmin,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'manjeri-id',
    });
    expect(manjeriAccess.allowed).toBe(true);
    expect(manjeriAccess.evaluatedScope).toBe('GLOBAL');

    const kondottyAccess = authorize({
      actor: superAdmin,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'kondotty-id',
    });
    expect(kondottyAccess.allowed).toBe(true);
    expect(kondottyAccess.evaluatedScope).toBe('GLOBAL');
  });

  it('enforces RBAC: Chapter President is permitted on assigned chapter but denied cross-chapter access', () => {
    const manjeriPresident: AuthActor = {
      userId: 'pres-manjeri',
      email: 'president.manjeri@mybf.in',
      phone: null,
      status: 'ACTIVE',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: 'manjeri-id',
    };

    // Permitted on own chapter
    const ownChapter = authorize({
      actor: manjeriPresident,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'manjeri-id',
    });
    expect(ownChapter.allowed).toBe(true);
    expect(ownChapter.evaluatedScope).toBe('CHAPTER');

    // Denied on another chapter (e.g. Kondotty)
    const crossChapter = authorize({
      actor: manjeriPresident,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'kondotty-id',
    });
    expect(crossChapter.allowed).toBe(false);
    expect(crossChapter.reason).toContain('Cross-chapter access violation');
  });

  it('enforces RBAC: Unauthenticated or inactive users are strictly denied access', () => {
    const unauthenticated = authorize({
      actor: null as any,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'manjeri-id',
    });
    expect(unauthenticated.allowed).toBe(false);

    const inactiveUser: AuthActor = {
      userId: 'inactive-01',
      email: 'inactive@mybf.in',
      phone: null,
      status: 'SUSPENDED',
      roles: ['CHAPTER_PRESIDENT'],
      chapterId: 'manjeri-id',
    };
    const suspendedAccess = authorize({
      actor: inactiveUser,
      action: 'chapter.read',
      resource: 'chapter',
      chapterId: 'manjeri-id',
    });
    expect(suspendedAccess.allowed).toBe(false);
  });
});
