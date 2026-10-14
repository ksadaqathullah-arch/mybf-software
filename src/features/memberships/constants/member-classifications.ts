/**
 * Single Authoritative Source of Truth for MYBF Member Classifications
 * Replaces old pricing/fee-based tiers with independent Category/Interest and Current Position.
 */

export const MEMBER_CATEGORIES = [
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'Enrolled in academic, technical, or higher education institutions.',
  },
  {
    value: 'ASPIRING_ENTREPRENEUR',
    label: 'Interested in Starting a Business',
    description: 'Planning, ideating, or preparing to launch a new commercial venture.',
  },
  {
    value: 'ENTREPRENEUR_BUSINESS_OWNER',
    label: 'Entrepreneur / Business Owner',
    description: 'Founders, directors, managing partners, and operational enterprise owners.',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other interests, community supporters, or non-traditional engagements.',
  },
] as const;

export type MemberCategoryValue = (typeof MEMBER_CATEGORIES)[number]['value'];

export const CURRENT_POSITIONS = [
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'Full-time or part-time student.',
  },
  {
    value: 'EMPLOYEE',
    label: 'Employee',
    description: 'Employed in public, private, or non-profit organizations.',
  },
  {
    value: 'WORKER',
    label: 'Worker',
    description: 'Skilled, trade, industrial, or service professional.',
  },
  {
    value: 'BUSINESS_OWNER',
    label: 'Business Owner',
    description: 'Proprietor, partner, or equity holder in a registered business.',
  },
  {
    value: 'ENTREPRENEUR',
    label: 'Entrepreneur',
    description: 'Startup founder building an innovative or scalable company.',
  },
  {
    value: 'SELF_EMPLOYED',
    label: 'Self-Employed',
    description: 'Independent practitioner, freelancer, or consultant.',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Retired, in transition, or other professional circumstance.',
  },
] as const;

export type CurrentPositionValue = (typeof CURRENT_POSITIONS)[number]['value'];

/**
 * Returns human-readable label or "Not provided" for unclassified historical records.
 */
export function getMemberCategoryLabel(value?: string | null): string {
  if (!value) return 'Not provided';
  const match = MEMBER_CATEGORIES.find((c) => c.value === value);
  return match ? match.label : value;
}

/**
 * Returns human-readable label or "Not provided" for unclassified historical records.
 */
export function getCurrentPositionLabel(value?: string | null): string {
  if (!value) return 'Not provided';
  const match = CURRENT_POSITIONS.find((p) => p.value === value);
  return match ? match.label : value;
}
