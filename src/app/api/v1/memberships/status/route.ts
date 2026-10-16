import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

/**
 * GET /api/v1/memberships/status?identifier=...
 * Public lookup for applicant to check the current review and activation status of their application.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier')?.trim().toLowerCase();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Identifier (email or phone) is required.' },
        { status: 400 }
      );
    }

    const digitsOnly = identifier.replace(/\D/g, '');
    const phoneCandidates: string[] = [identifier];
    if (digitsOnly.length === 10) {
      phoneCandidates.push(digitsOnly);
      phoneCandidates.push(`+91${digitsOnly}`);
      phoneCandidates.push(`91${digitsOnly}`);
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      const tenDigits = digitsOnly.slice(2);
      phoneCandidates.push(tenDigits);
      phoneCandidates.push(`+91${tenDigits}`);
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      const tenDigits = digitsOnly.slice(1);
      phoneCandidates.push(tenDigits);
      phoneCandidates.push(`+91${tenDigits}`);
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { phone: { in: phoneCandidates } },
          { profile: { primaryPhone: { in: phoneCandidates } } },
        ],
      },
      include: {
        profile: {
          include: { chapter: true },
        },
        membershipApplications: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          include: { chapter: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No application or account found matching this identifier.' },
        { status: 404 }
      );
    }

    const latestApp = user.membershipApplications[0];
    const payload = (latestApp?.payloadJson as Record<string, any>) || {};

    return NextResponse.json({
      success: true,
      userStatus: user.status,
      application: latestApp
        ? {
            id: latestApp.id,
            status: latestApp.status,
            chapterName: latestApp.chapter?.name,
            submittedAt: latestApp.submittedAt,
            requiresAgeException: payload.requestAgeException || payload.ageException?.requested || false,
            ageExceptionStatus: payload.ageException?.status,
            rejectionReason: latestApp.rejectionReason,
            hasActivationInvitation: Boolean(payload.activation?.tokenHash && !payload.activation?.usedAt),
            isActivated: Boolean(payload.activation?.usedAt) || user.status === 'ACTIVE',
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Status check failed.' },
      { status: 500 }
    );
  }
}
