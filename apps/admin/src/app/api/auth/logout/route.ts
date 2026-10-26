import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/server/auth';
import { destroySession } from '@shared/server/auth/session';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await destroySession(token).catch(() => {});
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}

