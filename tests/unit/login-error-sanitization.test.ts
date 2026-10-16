import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/auth/login/route';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { Prisma } from '@prisma/client';

describe('Auth Login Route Error Sanitization & Security Protection', () => {
  it('returns 400 when identifier or password is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: '' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Identifier (username/email/phone) and password are required.');
  });

  it('safely intercepts and masks Prisma database connection errors (503)', async () => {
    vi.spyOn(MembershipService, 'authenticateMember').mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError(
        "Can't reach database server at localhost:5432\nPlease make sure your database server is running at localhost:5432.",
        '6.19.3'
      )
    );

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'testuser', password: 'SecretPassword123!' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.code).toBe('DB_CONNECTION_ERROR');
    expect(data.error).toBe('Authentication service is temporarily unavailable. Please try again later.');
    // Must NOT leak database host, port, or Prisma internals
    expect(data.error).not.toContain('localhost');
    expect(data.error).not.toContain('5432');
    expect(data.error).not.toContain('Prisma');
    expect(data.error).not.toContain('DATABASE_URL');
  });

  it('safely intercepts missing DATABASE_URL environment errors (503)', async () => {
    vi.spyOn(MembershipService, 'authenticateMember').mockRejectedValueOnce(
      new Error('Environment variable not found: DATABASE_URL.')
    );

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'testuser', password: 'SecretPassword123!' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.code).toBe('DB_CONNECTION_ERROR');
    expect(data.error).toBe('Authentication service is temporarily unavailable. Please try again later.');
    expect(data.error).not.toContain('DATABASE_URL');
  });

  it('preserves 401 for invalid credentials without revealing internals', async () => {
    vi.spyOn(MembershipService, 'authenticateMember').mockRejectedValueOnce(
      new Error('Invalid username/email or password.')
    );

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'testuser', password: 'WrongPassword!' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.code).toBe('INVALID_CREDENTIALS');
    expect(data.error).toBe('Invalid username/email or password.');
  });

  it('preserves 403 for accounts pending Super Admin verification', async () => {
    vi.spyOn(MembershipService, 'authenticateMember').mockRejectedValueOnce(
      new Error('Your membership account is pending approval by the MYBF Super Administrator. Please try signing in after approval.')
    );

    const req = new NextRequest('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'pending_applicant', password: 'CorrectPassword123!' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.code).toBe('MEMBERSHIP_PENDING');
    expect(data.error).toContain('pending approval by the MYBF Super Administrator');
  });
});
