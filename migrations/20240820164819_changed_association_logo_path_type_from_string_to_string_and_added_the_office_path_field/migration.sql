-- AlterTable
ALTER TABLE "Association" ADD COLUMN     "officePath" TEXT,
ALTER COLUMN "logoPath" SET NOT NULL,
ALTER COLUMN "logoPath" SET DATA TYPE TEXT;
