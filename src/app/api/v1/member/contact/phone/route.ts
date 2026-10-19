import { NextRequest, NextResponse } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import {
  phoneChangeRequestSchema,
  phoneChangeVerifySchema,
} from '@/features/memberships/schemas/member-governance.schema';

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
    const { newPhone } = phoneChangeRequestSchema.parse(body);

    const result = await MemberIdentityService.requestPhoneChangeOtp(actor, newPhone);
    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to request phone change OTP.' },
      { status }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active session required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPhone, otp } = phoneChangeVerifySchema.parse(body);

    const result = await MemberIdentityService.verifyPhoneChangeOtp(actor, newPhone, otp);
    return NextResponse.json(result);
  } catch (error: any) {
    const status = error.name === 'ZodError' ? 400 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to verify phone change code.' },
      { status }
    );
  }
}
