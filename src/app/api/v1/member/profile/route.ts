import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import {
  updateProfilePersonalSchema,
  updateProfileProfessionalSchema,
  updateProfileLocationSchema,
} from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const data = await MemberIdentityService.getMemberCompleteProfile(actor);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch member profile.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { section, data } = body;

    if (section === 'personal') {
      const parsed = updateProfilePersonalSchema.parse(data);
      const updated = await MemberIdentityService.updatePersonalDetails(actor, parsed);
      return NextResponse.json({ success: true, section, data: updated });
    }

    if (section === 'professional') {
      const parsed = updateProfileProfessionalSchema.parse(data);
      const updated = await MemberIdentityService.updateProfessionalDetails(actor, parsed);
      return NextResponse.json({ success: true, section, data: updated });
    }

    if (section === 'location') {
      const parsed = updateProfileLocationSchema.parse(data);
      const updated = await MemberIdentityService.updateLocationDetails(actor, parsed);
      return NextResponse.json({ success: true, section, data: updated });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid section identifier. Expected: personal | professional | location' },
      { status: 400 }
    );
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 500;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile section.' },
      { status }
    );
  }
}
