-- MYBF Member Classification Migration
-- Non-destructive migration adding independent Member Category / Interest and Current Position
-- Safe for existing production data with backward compatibility

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "MemberCategory" AS ENUM ('STUDENT', 'ASPIRING_ENTREPRENEUR', 'ENTREPRENEUR_BUSINESS_OWNER', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CurrentPosition" AS ENUM ('STUDENT', 'EMPLOYEE', 'WORKER', 'BUSINESS_OWNER', 'ENTREPRENEUR', 'SELF_EMPLOYED', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter member_profiles to add classification columns
ALTER TABLE "member_profiles" 
ADD COLUMN IF NOT EXISTS "memberCategory" "MemberCategory",
ADD COLUMN IF NOT EXISTS "currentPosition" "CurrentPosition";

-- 3. Alter membership_applications to add classifications and make legacy categoryId optional
ALTER TABLE "membership_applications" 
ADD COLUMN IF NOT EXISTS "memberCategory" "MemberCategory",
ADD COLUMN IF NOT EXISTS "currentPosition" "CurrentPosition",
ALTER COLUMN "categoryId" DROP NOT NULL;

-- 4. Alter memberships to make legacy categoryId optional
ALTER TABLE "memberships" 
ALTER COLUMN "categoryId" DROP NOT NULL;

-- 5. Create Performance Indexes for analytics and filtering
CREATE INDEX IF NOT EXISTS "member_profiles_memberCategory_idx" ON "member_profiles"("memberCategory");
CREATE INDEX IF NOT EXISTS "member_profiles_currentPosition_idx" ON "member_profiles"("currentPosition");
CREATE INDEX IF NOT EXISTS "membership_applications_memberCategory_idx" ON "membership_applications"("memberCategory");
CREATE INDEX IF NOT EXISTS "membership_applications_currentPosition_idx" ON "membership_applications"("currentPosition");
