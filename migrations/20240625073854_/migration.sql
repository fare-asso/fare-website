/*
  Warnings:

  - A unique constraint covering the columns `[representativeId]` on the table `Association` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Association" ADD COLUMN     "representativeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Association_representativeId_key" ON "Association"("representativeId");

-- AddForeignKey
ALTER TABLE "Association" ADD CONSTRAINT "Association_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
