# MYBF Digital Management Platform - Enterprise Architecture Blueprint

## 1. Executive Architecture Summary
The Malappuram Youth Business Forum (MYBF) Digital Management Platform is architected as a **Feature-Based Modular Monolith** built on the Next.js App Router, React 19, TypeScript (Strict Mode), PostgreSQL, and Prisma ORM.

The platform is designed to initially coordinate **16 founding chapters** across Malappuram district, with a long-term architectural scalability posture capable of handling **5,000,000 member records** over time.

---

## 2. Brand Design System
Formulated according to official MYBF identity specifications:
- **Brand Blue (`#035AFC`)**: 78.5% primary dominance. Core actions, primary brand buttons, headers, accents.
- **Brand Gold/Yellow (`#FBC206`)**: 9.0% secondary accent. Badges, verification icons, highlight borders, callouts.
- **Brand White (`#FBFDFD`)**: 8.9% surface background (light mode) and high-contrast typography.
- **Brand Black (`#030405`)**: 3.6% void background (dark mode) and deep contrast surfaces.

---

## 3. Core Architectural Principles
1. **Feature-Based Modularity**: Business logic, schemas, server actions, and domain repositories are housed within `src/features/<feature-name>/`, preventing monolithic spaghetti code.
2. **Deny-by-Default Server Authorization**: Every request is evaluated server-side. Frontend route visibility is purely a UX affordance and never trusted for security.
3. **Multi-Tenant Chapter Isolation**: Chapter leaders (President, Secretary, Treasurer) are strictly restricted to their assigned chapter. Cross-chapter access attempts trigger immediate 403 Forbidden exceptions and audit log alerts.
4. **Permanent 10-Digit Identity (`MYBF-0000000001`)**: Sequential BigInt sequence numbers formatted into 10 numeric digits. Never encodes chapter or taluk into the permanent ID, ensuring identity permanence upon chapter transfers.
5. **Cryptographic Digital ID Passports**: High-entropy HMAC-SHA256 signed QR verification tokens. QR code scans resolve to an opaque public endpoint (`/verify/id/[token]`) that confirms credentials without exposing private personal or financial data.
6. **Maker-Checker Governance**: Membership applications must transition through `DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED / REJECTED`. Newly registered users possess zero privileged permissions until authorized by chapter officers.
7. **Idempotent Financial Ledger & QR Admission**: Payments are only confirmed via cryptographically signed webhook signatures (Razorpay / Stripe adapter) into double-entry ledger lines. Event attendance check-ins are idempotent to prevent duplicate admissions.

---

## 4. Portals and Route Map

### Public Route Group `(public)`
- `/` - Main landing page showcasing 16 chapters, digital ID card, categories, and forum metrics.
- `/about` - Forum strategic vision, mission, and leadership.
- `/chapters` - Directory of all 16 chapters with live Taluk filtering and search.
- `/chapters/[slug]` - Deep-dive chapter detail page with leadership rosters and local initiatives.
- `/events` - Upcoming business summits, conclaves, and workshops.
- `/membership` - Detailed membership charter, eligibility guidelines, fee schedules.

### Authentication Group `(auth)`
- `/login` - Secure email or 10-digit mobile login.
- `/register` - Comprehensive multi-step membership registration.

### Member Workspace `(member)`
- `/member` - Member dashboard with digital pass preview, chapter affiliation, and summit admissions.
- `/member/membership/id-card` - High-resolution interactive digital pass with test QR resolver.

### Chapter Executive Portal `(chapter)`
- `/chapter/[chapterId]` - Scoped chapter executive dashboard with Maker-Checker review queue, member roster, and chapter finance records.

### District Administration `(district-admin)`
- `/district-admin` - Malappuram district-wide oversight, cross-chapter comparative tables, 7 Taluk distributions, and financial collection summaries.

### Super Administration `(super-admin)`
- `/super-admin` - Root tenant governance, immutable system audit log stream, and 5M-capacity infrastructure posture.

### Verification Gateway `(verification)`
- `/verify/id/[token]` - Public tamper-proof credential verification status page.

---

## 5. Clean Architecture & Domain-Driven Layers (`src/server/`)

To support **50+ concurrent administrative and operational users** with strict invariants, decoupling, and high maintainability, the backend is structured following **Clean Architecture (Hexagonal / Ports & Adapters)**:

```
src/server/
├── domain/                      # 1. Pure Domain Layer (Enterprise Rules)
│   ├── common/                  # Entity base class, Result monad, Domain Errors
│   ├── identity/                # MemberProfile, VerificationChallenge, ChapterTransfer, ProfileCorrection
│   │   ├── entities/            # MemberProfileEntity, ChapterTransferEntity, etc.
│   │   └── value-objects/       # IndianPhoneNumber, PinCode, MemberId, AgeEligibility
│   ├── chapters/                # ChapterEntity
│   ├── events/                  # EventEntity
│   └── notifications/           # NotificationEntity
│
├── application/                 # 2. Application Layer (Use Cases & Ports)
│   ├── common/                  # IUseCase<TInput, TOutput> interface
│   ├── ports/                   # Repository & Gateway Contracts (Inversion of Control)
│   │   ├── member.repository.port.ts
│   │   ├── chapter.repository.port.ts
│   │   ├── event.repository.port.ts
│   │   ├── notification.repository.port.ts
│   │   ├── geography.repository.port.ts
│   │   ├── audit.repository.port.ts
│   │   ├── challenge.repository.port.ts
│   │   ├── transfer.repository.port.ts
│   │   ├── correction.repository.port.ts
│   │   └── crypto.gateway.port.ts
│   └── use-cases/               # Orchestrated Business Transactions
│       ├── identity/            # Request/Verify Phone OTP, Email Token, Profile Updates
│       ├── chapters/            # Request & Review Chapter Transfers (Maker-Checker)
│       ├── events/              # Event Registration & Idempotent QR Check-in
│       ├── geography/           # PIN-First Postal Lookup & Location Hierarchy Validation
│       └── notifications/       # User Notifications & Mark As Read
│
├── infrastructure/              # 3. Infrastructure Layer (Adapters & External Systems)
│   ├── repositories/            # Prisma ORM implementations of repository ports
│   │   ├── prisma-member.repository.ts
│   │   ├── prisma-chapter.repository.ts
│   │   ├── prisma-event.repository.ts
│   │   ├── prisma-notification.repository.ts
│   │   ├── prisma-geography.repository.ts
│   │   ├── prisma-audit.repository.ts
│   │   ├── prisma-challenge.repository.ts
│   │   ├── prisma-transfer.repository.ts
│   │   └── prisma-correction.repository.ts
│   └── gateways/                # Concrete cryptographic & payment gateways
│       └── node-crypto.gateway.ts
│
├── presentation/                # 4. Presentation & Delivery Adapters
│   └── http-response.ts         # Standardized ApiResponse, RFC 7807 problem details, error handling
│
├── container.ts                 # 5. Composition Root / Dependency Injection Container
│                                # Singleton lifecycle management for 50+ concurrent users
└── db.ts                        # Resilient Prisma Client connection pool
```

### Key Clean Architecture Invariants
1. **Dependency Rule**: Dependencies point inward only. Domain entities know nothing about Prisma, HTTP, or Next.js.
2. **Ports & Adapters**: Application use cases depend solely on abstract interfaces (`ports`), fulfilled by concrete `infrastructure/repositories/prisma-*`.
3. **Decoupled Delivery**: Route handlers (`src/app/api/v1/`) and Server Actions consume use cases via `container.<useCase>.execute(...)` and return uniform `ApiResponse`.
4. **Audit Immutability**: All sensitive domain mutations (profile changes, verification requests, chapter transfers, event check-ins) emit immutable `AuditEvent` records.
