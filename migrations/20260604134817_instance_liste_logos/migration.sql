/*
  Warnings:

  - You are about to drop the column `logoPath` on the `Instance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Instance" DROP COLUMN "logoPath",
ADD COLUMN     "logoPaths" TEXT[] DEFAULT ARRAY[]::TEXT[];
