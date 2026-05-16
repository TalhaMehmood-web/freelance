-- AlterTable
ALTER TABLE "buyer_requests" ALTER COLUMN "expires_at" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "blocked_at" TIMESTAMP(3),
ADD COLUMN     "blocked_by" TEXT,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;
