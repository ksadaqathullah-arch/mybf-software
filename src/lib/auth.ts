import 'server-only';

export { authorize, assertAuthorized } from '@/server/auth/policy';
export type {
  SystemRoleCode,
  AuthActor,
  DomainAction,
  DomainResource,
  AuthorizationContext,
  AuthorizationResult,
} from '@/server/auth/types';
