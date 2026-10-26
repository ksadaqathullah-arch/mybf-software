import { NextRequest, NextResponse } from 'next/server';
import { MembershipService } from '@shared/features/memberships/server/membership.service';
import { ADMIN_SESSION_COOKIE } from '@/server/auth';
import { createSession, SESSION_MAX_AGE_SECONDS } from '@shared/server/auth/session';

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

    // Create session in database via trusted session engine
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const sessionToken = await createSession(authResult.user.id, ipAddress, userAgent);

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
