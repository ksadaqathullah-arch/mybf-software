import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import { identityCorrectionRequestSchema } from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = identityCorrectionRequestSchema.parse(body);

    const result = await MemberIdentityService.submitIdentityCorrectionRequest(actor, parsed);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit identity correction request.' },
      { status }
    );
  }
}

export async function GET() {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const profileData = await MemberIdentityService.getMemberCompleteProfile(actor);
    return NextResponse.json({ success: true, data: profileData.correctionRequests });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch correction requests.' },
      { status: 500 }
    );
  }
}
