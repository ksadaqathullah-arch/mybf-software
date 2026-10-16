import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json({ available: false, error: 'Username is required.' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and periods.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase();

    // Check user table
    const existingUser = await db.user.findFirst({
      where: {
        username: { equals: cleanUsername, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ available: false });
    }

    // Check pending applications
    const pendingApps = await db.membershipApplication.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      select: { payloadJson: true },
    });

    const isTakenInApps = pendingApps.some((app) => {
      const p = (app.payloadJson as Record<string, any>) || {};
      return typeof p.username === 'string' && p.username.trim().toLowerCase() === cleanUsername;
    });

    return NextResponse.json({ available: !isTakenInApps });
  } catch (err: any) {
    return NextResponse.json({ available: false, error: 'Failed to verify username availability.' }, { status: 500 });
  }
}
