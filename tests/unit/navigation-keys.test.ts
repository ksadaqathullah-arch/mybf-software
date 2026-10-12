import { describe, it, expect } from 'vitest';

// Define the navigation item arrays as configured in each layout
const MEMBER_NAV_ITEMS = [
  { id: 'member-overview', label: 'Overview', href: '/member' },
  { id: 'member-id-card', label: 'Digital ID Pass', href: '/member/membership/id-card' },
  { id: 'member-chapter', label: 'My Chapter', href: '/chapters/manjeri' },
  { id: 'member-events', label: 'Events & Summits', href: '/events' },
  { id: 'member-dues', label: 'Dues & Receipts', href: '/member/payments' },
];

const CHAPTER_NAV_ITEMS = [
  { id: 'chapter-dashboard', label: 'Executive Dashboard', href: '/chapter/manjeri' },
  { id: 'chapter-applications', label: 'Pending Applications', href: '/chapter/manjeri/applications' },
  { id: 'chapter-roster', label: 'Chapter Roster', href: '/chapter/manjeri/members' },
  { id: 'chapter-meetings', label: 'Activities & Meetings', href: '/chapter/manjeri/meetings' },
  { id: 'chapter-finance', label: 'Chapter Finance', href: '/chapter/manjeri/finance' },
];

const DISTRICT_NAV_ITEMS = [
  { id: 'district-overview', label: 'District Overview', href: '/district-admin' },
  { id: 'district-chapters', label: '16 Chapters', href: '/chapters' },
  { id: 'district-geography', label: 'Taluk Geography', href: '/district-admin/geography' },
  { id: 'district-members', label: 'Members Directory', href: '/district-admin/members' },
  { id: 'district-finance', label: 'Financial Reports', href: '/district-admin/finance' },
  { id: 'district-analytics', label: 'Growth Analytics', href: '/district-admin/reports' },
];

const SUPER_ADMIN_NAV_ITEMS = [
  { id: 'super-admin-overview', label: 'System Overview', href: '/super-admin' },
  { id: 'super-admin-orgs', label: 'Organizations & Districts', href: '/super-admin/organizations' },
  { id: 'super-admin-roles', label: 'Roles & Permissions', href: '/super-admin/roles' },
  { id: 'super-admin-audit', label: 'Immutable Audit Logs', href: '/super-admin/audit-logs' },
  { id: 'super-admin-capacity', label: 'Database & 5M Capacity', href: '/super-admin/system-config' },
  { id: 'super-admin-security', label: 'Security Health', href: '/super-admin/security' },
];

describe('Portal Navigation Item Uniqueness & Key Stability', () => {
  const portalSuites = [
    { name: 'Member Portal', items: MEMBER_NAV_ITEMS },
    { name: 'Chapter Portal', items: CHAPTER_NAV_ITEMS },
    { name: 'District Admin Portal', items: DISTRICT_NAV_ITEMS },
    { name: 'Super Admin Portal', items: SUPER_ADMIN_NAV_ITEMS },
  ];

  portalSuites.forEach(({ name, items }) => {
    describe(name, () => {
      it('has non-empty and unique IDs for all items', () => {
        const ids = items.map((i) => i.id);
        expect(ids.every((id) => Boolean(id && id.trim()))).toBe(true);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it('has distinct destination hrefs for all items', () => {
        const hrefs = items.map((i) => i.href);
        const uniqueHrefs = new Set(hrefs);
        expect(uniqueHrefs.size).toBe(hrefs.length);
      });
    });
  });
});
