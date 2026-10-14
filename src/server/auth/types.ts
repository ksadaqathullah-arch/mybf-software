export type SystemRoleCode =
  | 'SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'DISTRICT_ADMIN'
  | 'CHAPTER_PRESIDENT'
  | 'CHAPTER_SECRETARY'
  | 'CHAPTER_TREASURER'
  | 'CHAPTER_COORDINATOR'
  | 'MEMBERSHIP_OFFICER'
  | 'EVENT_MANAGER'
  | 'FINANCE_OFFICER'
  | 'MEMBER';

export interface AuthActor {
  userId: string;
  email: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';
  roles: SystemRoleCode[];
  organizationId?: string | null;
  districtId?: string | null;
  chapterId?: string | null;
  memberProfileId?: string | null;
}

export type DomainAction =
  | 'member.create'
  | 'member.read_own'
  | 'member.update_own'
  | 'member.update_classification'
  | 'member.read_chapter'
  | 'member.read_district'
  | 'member.read_all'
  | 'member.review_application'
  | 'member.approve_application'
  | 'member.reject_application'
  | 'member.transfer_request'
  | 'member.transfer_approve'
  | 'chapter.read'
  | 'chapter.manage_leadership'
  | 'chapter.update_settings'
  | 'event.create'
  | 'event.publish'
  | 'event.checkin'
  | 'finance.view_ledger'
  | 'finance.refund_approve'
  | 'audit.view_logs'
  | 'admin.system_config';

export type DomainResource =
  | 'membership'
  | 'membership_application'
  | 'chapter'
  | 'district'
  | 'event'
  | 'attendance'
  | 'finance'
  | 'audit_log'
  | 'system_config';

export interface AuthorizationContext {
  actor: AuthActor | null | undefined;
  action: DomainAction;
  resource: DomainResource;
  organizationId?: string | null;
  chapterId?: string | null;
  recordOwnerId?: string | null;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  evaluatedScope?: 'GLOBAL' | 'ORGANIZATION' | 'DISTRICT' | 'CHAPTER' | 'OWN_RECORD' | 'NONE';
}
