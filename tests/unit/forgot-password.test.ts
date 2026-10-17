import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/auth/forgot-password/route';
import { db } from '@/server/db';
import { Prisma } from '@prisma/client';

describe('POST /api/v1/auth/forgot-password API Route', () => {
  it('returns 400 when identifier is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: '' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Identifier (username, email, or phone) is required.');
  });

  it('returns uniform 200 success response when identifier is provided', async () => {
    vi.spyOn(db.user, 'findFirst').mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'anas_manjeri' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('If an active account exists');
  });

  it('handles database connection failure gracefully with 503 without leaking internals', async () => {
    vi.spyOn(db.user, 'findFirst').mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError(
        "Can't reach database server at localhost:5432\nPlease make sure your database server is running at localhost:5432.",
        '6.19.3'
      )
    );

    const req = new NextRequest('http://localhost:3000/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: 'anas_manjeri' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.code).toBe('DB_CONNECTION_ERROR');
    expect(data.error).toBe('Password recovery service is temporarily unavailable. Please try again later.');
    expect(data.error).not.toContain('localhost');
    expect(data.error).not.toContain('5432');
  });
});
