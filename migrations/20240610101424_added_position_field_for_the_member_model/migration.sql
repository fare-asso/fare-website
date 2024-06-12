/*
  Warnings:

  - You are about to drop the column `image` on the `Member` table. All the data in the column will be lost.
  - Added the required column `picturePath` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Member_email_key";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "image",
ADD COLUMN     "picturePath" TEXT NOT NULL,
ADD COLUMN     "position" TEXT NOT NULL DEFAULT 'membre actif',
ALTER COLUMN "email" DROP NOT NULL;
