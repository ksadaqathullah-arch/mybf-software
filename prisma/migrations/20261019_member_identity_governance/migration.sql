-- Migration: 20261019_member_identity_governance
-- Additive, non-destructive migration for Member Identity, Verification & Governance

-- 1. Create CorrectionRequestStatus Enum
DO $$ BEGIN
    CREATE TYPE "CorrectionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance ChapterTransfer with review and execution audit columns
ALTER TABLE "chapter_transfers" ADD COLUMN IF NOT EXISTS "currentReviewNotes" TEXT;
ALTER TABLE "chapter_transfers" ADD COLUMN IF NOT EXISTS "destinationReviewNotes" TEXT;
ALTER TABLE "chapter_transfers" ADD COLUMN IF NOT EXISTS "districtReviewNotes" TEXT;
ALTER TABLE "chapter_transfers" ADD COLUMN IF NOT EXISTS "districtReviewedAt" TIMESTAMP(3);
ALTER TABLE "chapter_transfers" ADD COLUMN IF NOT EXISTS "transferEffectiveDate" TIMESTAMP(3);

-- 3. Create ContactVerificationChallenge Table
CREATE TABLE IF NOT EXISTS "contact_verification_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactType" TEXT NOT NULL,
    "currentValue" TEXT,
    "targetValue" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "resendAfter" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_verification_challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contact_verification_challenges_userId_contactType_isVerified_idx" 
ON "contact_verification_challenges"("userId", "contactType", "isVerified");

DO $$ BEGIN
    ALTER TABLE "contact_verification_challenges" 
    ADD CONSTRAINT "contact_verification_challenges_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create ProfileCorrectionRequest Table
CREATE TABLE IF NOT EXISTS "profile_correction_requests" (
    "id" TEXT NOT NULL,
    "memberProfileId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "requestedValue" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "documentUrl" TEXT,
    "status" "CorrectionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_correction_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "profile_correction_requests_memberProfileId_status_idx" 
ON "profile_correction_requests"("memberProfileId", "status");

CREATE INDEX IF NOT EXISTS "profile_correction_requests_status_idx" 
ON "profile_correction_requests"("status");

DO $$ BEGIN
    ALTER TABLE "profile_correction_requests" 
    ADD CONSTRAINT "profile_correction_requests_memberProfileId_fkey" 
    FOREIGN KEY ("memberProfileId") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create MemberChapterAssignmentHistory Table
CREATE TABLE IF NOT EXISTS "member_chapter_assignment_history" (
    "id" TEXT NOT NULL,
    "memberProfileId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "transferId" TEXT,
    "reason" TEXT,

    CONSTRAINT "member_chapter_assignment_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "member_chapter_assignment_history_memberProfileId_idx" 
ON "member_chapter_assignment_history"("memberProfileId");

CREATE INDEX IF NOT EXISTS "member_chapter_assignment_history_chapterId_idx" 
ON "member_chapter_assignment_history"("chapterId");

DO $$ BEGIN
    ALTER TABLE "member_chapter_assignment_history" 
    ADD CONSTRAINT "member_chapter_assignment_history_memberProfileId_fkey" 
    FOREIGN KEY ("memberProfileId") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "member_chapter_assignment_history" 
    ADD CONSTRAINT "member_chapter_assignment_history_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
