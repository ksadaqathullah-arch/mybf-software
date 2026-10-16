import { NextRequest, NextResponse } from 'next/server';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/server/auth/session';
import { Prisma } from '@prisma/client';

function isDatabaseError(error: any): boolean {
  if (!error) return false;
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    return true;
  }
  const msg = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  const name = typeof error.name === 'string' ? error.name.toLowerCase() : '';
  return (
    name.includes('prisma') ||
    msg.includes('prisma') ||
    msg.includes('database') ||
    msg.includes('database_url') ||
    msg.includes("can't reach database") ||
    msg.includes('cant reach database') ||
    msg.includes('connection refused') ||
    msg.includes('econnrefused') ||
    msg.includes('etimedout') ||
    msg.includes('connection terminated') ||
    msg.includes('prepared statement') ||
    msg.includes('pgbouncer')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Identifier (username/email/phone) and password are required.' },
        { status: 400 }
      );
    }

    const authResult = await MembershipService.authenticateMember(identifier, password);

    // Create session in database
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const sessionToken = await createSession(authResult.user.id, ipAddress, userAgent);

    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        phone: authResult.user.phone,
        fullName: authResult.profile?.fullName,
        roles: authResult.user.roles,
        chapterId: authResult.profile?.chapterId,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error: any) {
    // 1. Isolate database connectivity and infrastructure errors
    if (isDatabaseError(error)) {
      console.error('[AUTH_LOGIN_DB_ERROR] Database connection or infrastructure error during login:', error?.message || error);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication service is temporarily unavailable. Please try again later.',
          code: 'DB_CONNECTION_ERROR',
        },
        { status: 503 }
      );
    }

    // 2. Safe authentication & membership status handling
    const errorMessage = typeof error?.message === 'string' ? error.message : 'Authentication failed.';

    // Differentiate pending approval, suspended, or invalid credentials
    if (errorMessage.includes('pending approval')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: 'MEMBERSHIP_PENDING',
        },
        { status: 403 }
      );
    }

    if (errorMessage.includes('suspended') || errorMessage.includes('deactivated')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: 'ACCOUNT_INACTIVE',
        },
        { status: 403 }
      );
    }

    if (errorMessage.includes('Invalid username/email or password')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid username/email or password.',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: 'AUTH_FAILED',
      },
      { status: 401 }
    );
  }
}

