/*
  Warnings:

  - You are about to drop the column `email` on the `Association` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Association` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Association_email_key";

-- AlterTable
ALTER TABLE "Association" DROP COLUMN "email",
DROP COLUMN "logo",
ADD COLUMN     "birtdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "logoPath" TEXT[],
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT;
