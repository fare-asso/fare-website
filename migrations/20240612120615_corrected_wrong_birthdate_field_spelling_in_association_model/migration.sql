/*
  Warnings:

  - You are about to drop the column `birtdate` on the `Association` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Association" DROP COLUMN "birtdate",
ADD COLUMN     "birthdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
