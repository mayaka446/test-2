-- Apply once to an existing PostgreSQL database before deploying this version.
-- Back up the database first. Fresh databases should be created with `npx prisma db push`.
DO $$ BEGIN
  CREATE TYPE "SchoolStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE "School"
  ADD COLUMN IF NOT EXISTS "status" "SchoolStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
UPDATE "School" SET "status" = 'APPROVED', "active" = TRUE WHERE "slug" = 'mayakas';
