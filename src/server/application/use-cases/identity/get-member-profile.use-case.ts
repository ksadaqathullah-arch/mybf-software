import { IUseCase } from '../../common/use-case.interface';
import { IMemberRepository } from '../../ports/member.repository.port';
import { AuthActor } from '@/server/auth/types';
import { assertAuthorized } from '@/server/auth/policy';
import { UnauthorizedError } from '@/server/domain/common/domain-error';

export interface GetMemberProfileInput {
  targetUserId?: string;
}

export class GetMemberProfileUseCase implements IUseCase<GetMemberProfileInput, any> {
  constructor(private readonly memberRepo: IMemberRepository) {}

  public async execute(input: GetMemberProfileInput, actor?: AuthActor): Promise<any> {
    if (!actor || actor.status !== 'ACTIVE') {
      throw new UnauthorizedError('Active authenticated session required to retrieve profile.');
    }

    const targetUserId = input.targetUserId || actor.userId;

    // Policy check: user can read own, or admin can read
    assertAuthorized({
      actor,
      action: 'member.read_own',
      resource: 'membership',
      recordOwnerId: targetUserId,
    });

    return this.memberRepo.getCompleteProfile(targetUserId);
  }
}
