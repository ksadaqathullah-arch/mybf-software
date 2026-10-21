import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { container } from '@/server/container';
import { ApiResponse } from '@/server/presentation/http-response';
import {
  phoneChangeRequestSchema,
  phoneChangeVerifySchema,
} from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const { newPhone } = phoneChangeRequestSchema.parse(body);

    const result = await container.requestPhoneOtp.execute({ newPhone }, actor);
    return ApiResponse.ok(result);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const { newPhone, otp } = phoneChangeVerifySchema.parse(body);

    const result = await container.verifyPhoneOtp.execute({ newPhone, otp }, actor);
    return ApiResponse.ok(result);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}
