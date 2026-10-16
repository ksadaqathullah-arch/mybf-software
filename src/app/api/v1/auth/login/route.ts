import { NextRequest, NextResponse } from 'next/server';
import { MembershipService } from '@/features/memberships/server/membership.service';
import { createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/server/auth/session';

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
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed.' },
      { status: 401 }
    );
  }
}
