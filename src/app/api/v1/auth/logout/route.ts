import { NextRequest, NextResponse } from 'next/server';
import { destroySession, SESSION_COOKIE_NAME, SESSION_COOKIE_ADMIN_NAME } from '@/server/auth/session';

export async function POST(request: NextRequest) {
  const publicToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const adminToken = request.cookies.get(SESSION_COOKIE_ADMIN_NAME)?.value;

  if (publicToken) {
    await destroySession(publicToken).catch(() => {});
  }
  if (adminToken) {
    await destroySession(adminToken).catch(() => {});
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(SESSION_COOKIE_ADMIN_NAME);
  return response;
}

