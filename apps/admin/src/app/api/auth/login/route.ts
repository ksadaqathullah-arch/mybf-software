import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/server/db';
import { MembershipService } from '@shared/features/memberships/server/membership.service';
import { ADMIN_SESSION_COOKIE } from '@/server/auth';

const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Identifier and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await MembershipService.authenticateMember(identifier, password);

    // Strictly enforce Central System roles: SUPER_ADMIN or ORGANIZATION_ADMIN
    const isCentralAdmin =
      authResult.user.roles.includes('SUPER_ADMIN') ||
      authResult.user.roles.includes('ORGANIZATION_ADMIN');

    if (!isCentralAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: The Central System Workspace is reserved exclusively for Super Administrators and Organization Leadership.',
          code: 'CENTRAL_ADMIN_ONLY',
        },
        { status: 403 }
      );
    }

    // Create session in database
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    await db.session.create({
      data: {
        userId: authResult.user.id,
        sessionToken,
        expiresAt,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        roles: authResult.user.roles,
      },
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    const errorMessage = typeof error?.message === 'string' ? error.message : 'Authentication failed.';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 401 }
    );
  }
}
