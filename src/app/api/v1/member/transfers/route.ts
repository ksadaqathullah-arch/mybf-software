import { NextRequest } from 'next/server';
import { getCurrentActor } from '@/server/auth/session';
import { container } from '@/server/container';
import { ApiResponse } from '@/server/presentation/http-response';
import { MemberIdentityService } from '@/features/memberships/server/member-identity.service';
import { chapterTransferRequestSchema } from '@/features/memberships/schemas/member-governance.schema';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const body = await request.json();
    const parsed = chapterTransferRequestSchema.parse(body);

    const result = await container.requestChapterTransfer.execute(
      { toChapterId: parsed.destinationChapterId, reason: parsed.reason },
      actor
    );
    return ApiResponse.ok(result);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}

export async function GET() {
  try {
    const actor = await getCurrentActor();
    if (!actor || actor.status !== 'ACTIVE') {
      return ApiResponse.unauthorized();
    }

    const profileData = await MemberIdentityService.getMemberCompleteProfile(actor);
    return ApiResponse.ok(profileData.transfers);
  } catch (error: any) {
    return ApiResponse.handle(error);
  }
}
