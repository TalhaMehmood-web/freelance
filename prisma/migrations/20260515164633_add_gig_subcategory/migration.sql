-- AlterTable
ALTER TABLE "buyer_requests" ALTER COLUMN "expires_at" SET DEFAULT now() + interval '7 days';

-- AlterTable
ALTER TABLE "gigs" ADD COLUMN     "subcategory_id" TEXT;

-- AddForeignKey
ALTER TABLE "gigs" ADD CONSTRAINT "gigs_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
