# MYBF - Malappuram Youth Business Forum
### Enterprise Digital Management & Membership Platform

A Feature-Based Modular Monolith architecture engineered for the **Malappuram Youth Business Forum (MYBF)**, designed for **16 founding chapters** across Malappuram with a long-term scalability capacity target of **5,000,000 member records**.

---

## 🎨 Official Brand Identity
- **Brand Blue (`#035AFC`)** [78.5%]: Primary action buttons, brand badges, active states.
- **Brand Gold/Yellow (`#FBC206`)** [9.0%]: Secondary badges, awards, highlights, accents.
- **Brand White (`#FBFDFD`)** [8.9%]: Crisp clean light surfaces, typography on dark surfaces.
- **Brand Black (`#030405`)** [3.6%]: Deep navy void background in dark mode, high-contrast text in light mode.

---

## 🏛️ The 16 Founding Chapters of Malappuram
1. **Manjeri Chapter** (`CHP-01-MANJERI`)
2. **Malappuram Central Chapter** (`CHP-02-MLP-CENTRAL`)
3. **Perinthalmanna Chapter** (`CHP-03-PERINTHALMANNA`)
4. **Tirur Chapter** (`CHP-04-TIRUR`)
5. **Kottakkal Chapter** (`CHP-05-KOTTAKKAL`)
6. **Ponnani Chapter** (`CHP-06-PONNANI`)
7. **Nilambur Chapter** (`CHP-07-NILAMBUR`)
8. **Kondotty Chapter** (`CHP-08-KONDOTTY`)
9. **Parappanangadi Chapter** (`CHP-09-PARAPPANANGADI`)
10. **Tanur Chapter** (`CHP-10-TANUR`)
11. **Tirurangadi Chapter** (`CHP-11-TIRURANGADI`)
12. **Edappal Chapter** (`CHP-12-EDAPPAL`)
13. **Valanchery Chapter** (`CHP-13-VALANCHERY`)
14. **Wandoor Chapter** (`CHP-14-WANDOOR`)
15. **Areacode Chapter** (`CHP-15-AREACODE`)
16. **Changaramkulam Chapter** (`CHP-16-CHANGARAMKULAM`)

---

## 🚀 Key Architectural Capabilities

- **Permanent 10-Digit Identifier**: `MYBF-0000000001` sequential code that remains unchanged during inter-chapter transfers.
- **Cryptographic Digital ID Passes**: HMAC-SHA256 signed QR code tokens verifying authenticity via `/verify/id/[token]`.
- **Deny-by-Default Server Authorization**: Strict chapter isolation and organization-level boundary enforcement in `src/server/auth/policy.ts`.
- **Auditable Double-Entry Finance**: Payment intents with idempotency keys and gateway webhook signature verification.
- **Idempotent Event Check-in**: Scanned QR codes prevent duplicate attendance counts.
- **Malappuram Administrative Geography Master**: Relational model connecting 7 Taluks, 12 Municipalities, Grama Panchayats, and PIN codes.

---

## 💻 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19, Tailwind CSS v4, Lucide React
- **Language**: TypeScript (Strict Mode)
- **Database ORM**: PostgreSQL via Prisma ORM v6
- **Validation**: Zod
- **Testing**: Vitest with path alias resolution

---

## 🛠️ Commands & Scripts

```bash
# Install dependencies
npm install

# Run TypeScript strict type-checking
npm run typecheck

# Run automated Vitest test suite
npm run test

# Validate Prisma database schema
npm run prisma:validate

# Build Next.js production bundle (51 static & dynamic pages)
npm run build

# Start local development server
npm run dev
```

---

## 📂 Architecture Structure
```
src/
├── app/
│   ├── (public)/          # Landing, About, 16 Chapters, Events, Membership
│   ├── (auth)/            # Login, Registration, Verification
│   ├── (member)/          # Member Workspace & Digital ID Pass
│   ├── (chapter)/         # Chapter Executive Dashboard (16 chapters)
│   ├── (district-admin)/  # Malappuram District Oversight & 7 Taluk metrics
│   ├── (super-admin)/     # Platform governance & audit stream
│   ├── (verification)/    # QR Public ID Verification (/verify/id/[token])
│   └── api/v1/            # Secure REST endpoints & webhook receivers
├── features/              # Feature modules (memberships, chapters, geography, finance, events)
├── components/            # UI components, layout shells, badges, cards
├── server/                # Server-only database client and authorization engine
├── lib/                   # Formatting, currency, cn utility
└── styles/                # Brand tokens (#035AFC, #FBC206, #FBFDFD, #030405)
```
