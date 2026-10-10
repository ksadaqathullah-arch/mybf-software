# MYBF Platform - Database Blueprint & 5M Capacity Scaling Strategy

## 1. Relational Database Design
The schema is built on **PostgreSQL** via **Prisma ORM**, organized across 9 core domains:

1. **Organizational Hierarchy**: `organizations`, `districts`, `chapters`, `chapter_leadership`
2. **Identity & Access**: `users`, `sessions`, `roles`, `permissions`, `role_permissions`, `user_role_assignments`
3. **Membership Lifecycle**: `member_profiles`, `membership_categories`, `membership_applications`, `membership_approval_actions`, `memberships`, `membership_id_cards`, `chapter_transfers`
4. **Geographical Master**: `countries`, `states`, `taluks`, `local_bodies`, `wards`, `pin_codes`, `pin_locality_links`
5. **Events & Admissions**: `events`, `event_sessions`, `event_registrations`, `attendance_records`
6. **Meetings & Governance**: `meetings`, `meeting_minutes`, `action_items`
7. **Commercial Ecosystem**: `business_profiles`, `service_listings`, `referral_leads`, `mentorship_profiles`
8. **Auditable Finance**: `payment_intents`, `payment_transactions`, `invoices`
9. **Platform & Observability**: `audit_events`, `notifications`, `system_configs`, `feature_flags`

---

## 2. Capacity Scaling Strategy to 5,000,000 Members

### A. Identifier Design
- **Internal Storage**: `id UUID @default(uuid())` provides collision-resistant, cryptographically random primary keys across distributed nodes.
- **Public Membership Code**:
  - Format: `MYBF-0000000001` (10 decimal digits).
  - Backed by a PostgreSQL sequential counter (`sequenceNumber BigInt @unique`).
  - At 10 digits, the namespace supports up to **9,999,999,999** unique records, exceeding the 5M target by a factor of 2,000.
  - **Zero Encoding**: Chapter, taluk, or year is intentionally excluded from the permanent code to prevent identity alteration upon chapter transfers.

### B. Indexing Strategy
- Composite indexes on frequently filtered multi-tenant predicates:
  - `@@index([organizationId, status])`
  - `@@index([chapterId, status])`
  - `@@index([primaryPhone])` and `@@index([email])` for sub-millisecond deduplication checks.
- Unique constraints on:
  - `[eventId, userId]` in `event_registrations`
  - `[registrationId]` in `attendance_records` to enforce idempotent admissions.

### C. Large-Volume Table Partitioning Plan (Post-Pilot)
When record volumes exceed 500,000 rows, the following tables should be partitioned natively in PostgreSQL:
1. `audit_events`: Range partition by `createdAt` (Monthly tables).
2. `attendance_records`: List partition by `eventId` or range by fiscal year.
3. `notifications`: Range partition by `createdAt` with automated retention purge after 90 days.
