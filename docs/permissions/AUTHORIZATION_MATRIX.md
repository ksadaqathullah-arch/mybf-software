# MYBF Platform - Authorization Matrix & Policy Rules

## 1. Principles
- **Deny-by-Default**: Unless an explicit rule permits an action, authorization evaluates to false.
- **Server Enforcement**: Handled via `assertAuthorized()` in `src/server/auth/policy.ts`.
- **Zero Client Trust**: `chapterId` or `role` provided in client payloads is cross-checked against database session claims.

---

## 2. Role Hierarchy & Permitted Scopes

| Role | Scope | Key Capabilities | Prohibited Actions |
| :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` | Global Platform | System settings, audit logs, emergency recovery, multi-org config | Self-approval on business transactions without audit record |
| `ORGANIZATION_ADMIN` | Organization (`MYBF`) | Central forum leadership, cross-district policy, category dues | Cannot bypass audit logging |
| `DISTRICT_ADMIN` | District (`MLP`) | Aggregated metrics for all 16 chapters, geographic taluk reporting | Cannot modify root platform security |
| `CHAPTER_PRESIDENT` | Chapter (`CHP-*`) | Executive governance, review applications, meetings, leadership | Cross-chapter modifications (Strictly 403 Forbidden) |
| `CHAPTER_SECRETARY` | Chapter (`CHP-*`) | Minutes, attendance reports, chapter communications | Cannot authorize treasury disbursements |
| `CHAPTER_TREASURER` | Chapter (`CHP-*`) | Chapter fund ledger, receipts, membership dues tracking | Cross-chapter financial exports |
| `CHAPTER_COORDINATOR`| Chapter (`CHP-*`) | Event coordination, member engagement | Sensitive member personal exports |
| `MEMBERSHIP_OFFICER` | Chapter (`CHP-*`) | Maker-checker review queue processing | Unilateral fee waiver without treasurer sign-off |
| `EVENT_MANAGER` | Chapter/District | Event registration, scanner check-in verification | Editing membership profiles |
| `MEMBER` | Own Record | View own profile, digital ID card, my chapter, registered events | Accessing other members' private contact/finance data |

---

## 3. Maker-Checker Lifecycle Transitions
```
[DRAFT]
   │
   ▼
[SUBMITTED] ──(Applicant submits verified mobile/email)
   │
   ▼
[UNDER_REVIEW] ──(Chapter Membership Officer verifies trade evidence)
   │
   ├───────────────► [ADDITIONAL_INFO_REQUESTED]
   │
   ├───────────────► [REJECTED] (With logged reason & timestamp)
   │
   ▼
[APPROVED] ──(Chapter President / Secretary sign-off)
   │
   ▼
[ACTIVE] ──(Permanent 10-digit ID allocated: MYBF-0000000001, QR card issued)
   │
   ├───────────────► [RENEWAL_DUE]
   ├───────────────► [SUSPENDED]
   └───────────────► [TRANSFERRED] (Permanent ID preserved; chapter pointer updated)
```
