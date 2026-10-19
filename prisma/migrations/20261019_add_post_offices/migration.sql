-- CreateTable
CREATE TABLE IF NOT EXISTS "post_offices" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "officeType" TEXT NOT NULL DEFAULT 'SO',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'Delivery',
    "postalDistrict" TEXT NOT NULL DEFAULT 'Malappuram',
    "postalDivision" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Kerala',
    "talukId" TEXT,
    "localBodyId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_offices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "post_offices_code_key" ON "post_offices"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "post_offices_name_pinCode_key" ON "post_offices"("name", "pinCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "post_offices_pinCode_idx" ON "post_offices"("pinCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "post_offices_talukId_idx" ON "post_offices"("talukId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "post_offices_localBodyId_idx" ON "post_offices"("localBodyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "post_offices_name_idx" ON "post_offices"("name");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'post_offices_pinCode_fkey'
    ) THEN
        ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_pinCode_fkey" FOREIGN KEY ("pinCode") REFERENCES "pin_codes"("code") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'post_offices_talukId_fkey'
    ) THEN
        ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_talukId_fkey" FOREIGN KEY ("talukId") REFERENCES "taluks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'post_offices_localBodyId_fkey'
    ) THEN
        ALTER TABLE "post_offices" ADD CONSTRAINT "post_offices_localBodyId_fkey" FOREIGN KEY ("localBodyId") REFERENCES "local_bodies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
