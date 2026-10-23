import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { ADMIN_SESSION_COOKIE } from '@/server/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
