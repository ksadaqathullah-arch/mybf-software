import 'server-only';
import { AuthorizationContext, AuthorizationResult } from './types';

/**
 * Deny-by-default server authorization policy engine.
 * Validates organizational and chapter boundaries strictly.
 */
export function authorize(context: AuthorizationContext): AuthorizationResult {
  const { actor, action, organizationId, chapterId, recordOwnerId } = context;

  // 1. Unauthenticated or inactive actor is strictly denied
  if (!actor || actor.status !== 'ACTIVE') {
    return {
      allowed: false,
      reason: 'Actor is not authenticated or account is not in ACTIVE status.',
      evaluatedScope: 'NONE',
    };
  }

  // 2. Super Administrator - audited emergency & system level access
  if (actor.roles.includes('SUPER_ADMIN')) {
    return {
      allowed: true,
      evaluatedScope: 'GLOBAL',
    };
  }

  // 3. Organization Administrator - scoped to the actor's assigned organization
  if (actor.roles.includes('ORGANIZATION_ADMIN')) {
    if (!organizationId || organizationId === actor.organizationId) {
      return {
        allowed: true,
        evaluatedScope: 'ORGANIZATION',
      };
    }
    return {
      allowed: false,
      reason: 'Cross-organization boundary violation.',
      evaluatedScope: 'NONE',
    };
  }

  // 4. District Administrator - Malappuram district oversight
  if (actor.roles.includes('DISTRICT_ADMIN')) {
    // District admin can view/manage across all chapters in district, but not cross-org
    if (!organizationId || organizationId === actor.organizationId) {
      return {
        allowed: true,
        evaluatedScope: 'DISTRICT',
      };
    }
    return {
      allowed: false,
      reason: 'Cross-district or foreign organization boundary violation.',
      evaluatedScope: 'NONE',
    };
  }

  // 5. Chapter Leadership (President, Secretary, Treasurer, Coordinator)
  const isChapterLeader = actor.roles.some((r) =>
    ['CHAPTER_PRESIDENT', 'CHAPTER_SECRETARY', 'CHAPTER_TREASURER', 'CHAPTER_COORDINATOR', 'MEMBERSHIP_OFFICER'].includes(r)
  );

  if (isChapterLeader) {
    // Must strictly match chapterId
    if (chapterId && chapterId === actor.chapterId) {
      // Security: Chapter leadership appointments are centrally reserved to the Super Administrator
      if (action === 'chapter.manage_leadership') {
        return {
          allowed: false,
          reason: 'Chapter leadership appointments are centrally reserved to the Super Administrator.',
          evaluatedScope: 'NONE',
        };
      }

      // Treasurer specific permissions
      if (action.startsWith('finance.') && !actor.roles.includes('CHAPTER_TREASURER') && !actor.roles.includes('CHAPTER_PRESIDENT')) {
        return {
          allowed: false,
          reason: 'Only chapter treasurer or president can authorize financial actions.',
          evaluatedScope: 'NONE',
        };
      }
      return {
        allowed: true,
        evaluatedScope: 'CHAPTER',
      };
    }

    // Attempting to access another chapter
    if (chapterId && chapterId !== actor.chapterId) {
      return {
        allowed: false,
        reason: 'Cross-chapter access violation. Leaders may only manage their assigned chapter.',
        evaluatedScope: 'NONE',
      };
    }
  }

  // 6. Own-record ownership check (e.g. member updating own profile, viewing own card)
  if (recordOwnerId && recordOwnerId === actor.userId) {
    if (
      action === 'member.read_own' ||
      action === 'member.transfer_request' ||
      action === 'member.update_own' ||
      action === 'member.update_classification' ||
      action === 'member.verify_contact' ||
      action === 'member.request_correction'
    ) {
      return {
        allowed: true,
        evaluatedScope: 'OWN_RECORD',
      };
    }
  }

  // 7. General Member read-only permissions
  if (actor.roles.includes('MEMBER')) {
    if (action === 'chapter.read' || action === 'event.checkin') {
      return {
        allowed: true,
        evaluatedScope: 'CHAPTER',
      };
    }
  }

  // 8. Deny-by-default fallback
  return {
    allowed: false,
    reason: `Action '${action}' denied by default policy for actor roles [${actor.roles.join(', ')}].`,
    evaluatedScope: 'NONE',
  };
}

/**
 * Asserts authorization or throws a standardized error
 */
export function assertAuthorized(context: AuthorizationContext): void {
  const result = authorize(context);
  if (!result.allowed) {
    const error = new Error(`Forbidden: ${result.reason || 'Access denied'}`);
    (error as unknown as { statusCode: number }).statusCode = 403;
    throw error;
  }
}
