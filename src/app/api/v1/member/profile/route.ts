import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { container } from '@/server/container';
import { ApiResponse } from '@/server/presentation/http-response';
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
      return ApiResponse.unauthorized();
    }

    const data = await MemberIdentityService.getMemberCompleteProfile(actor);
    return ApiResponse.ok(data);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const { section, data } = body;

    if (section === 'personal') {
      const parsed = updateProfilePersonalSchema.parse(data);
      await container.updateMemberProfile.execute(
        { segment: 'personal', data: parsed },
        actor
      );
      return ApiResponse.ok({ section, data: parsed });
    }

    if (section === 'professional') {
      const parsed = updateProfileProfessionalSchema.parse(data);
      await container.updateMemberProfile.execute(
        { segment: 'professional', data: parsed },
        actor
      );
      return ApiResponse.ok({ section, data: parsed });
    }

    if (section === 'location') {
      const parsed = updateProfileLocationSchema.parse(data);
      await container.updateMemberProfile.execute(
        { segment: 'location', data: parsed },
        actor
      );
      return ApiResponse.ok({ section, data: parsed });
    }

    return ApiResponse.badRequest('Invalid section identifier. Expected: personal | professional | location');
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}
