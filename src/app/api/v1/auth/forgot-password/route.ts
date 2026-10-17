import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
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
    msg.includes('etimedout')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim().toLowerCase() : '';

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Identifier (username, email, or phone) is required.' },
        { status: 400 }
      );
    }

    try {
      // Lookup user silently for audit and dispatch
      const user = await db.user.findFirst({
        where: {
          OR: [
            { username: { equals: identifier, mode: 'insensitive' } },
            { email: { equals: identifier, mode: 'insensitive' } },
            { phone: identifier },
            { profile: { primaryPhone: identifier } },
          ],
        },
        select: { id: true, status: true, email: true },
      });

      if (user && user.status === 'ACTIVE') {
        await db.auditEvent.create({
          data: {
            actorEmail: user.email || identifier,
            action: 'PASSWORD_RESET_REQUESTED',
            resource: 'User',
            resourceId: user.id,
            diffJson: { identifierProvided: identifier },
          },
        }).catch(() => null);
      }
    } catch (dbErr) {
      if (isDatabaseError(dbErr)) {
        console.error('[FORGOT_PASSWORD_DB_ERROR]', dbErr);
        return NextResponse.json(
          {
            success: false,
            error: 'Password recovery service is temporarily unavailable. Please try again later.',
            code: 'DB_CONNECTION_ERROR',
          },
          { status: 503 }
        );
      }
    }

    // Always return uniform 200 to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an active account exists with the provided identifier, recovery instructions have been dispatched.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }
}
