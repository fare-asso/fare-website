/*
  Warnings:

  - A unique constraint covering the columns `[adhesionId]` on the table `Association` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Association" ADD COLUMN     "adhesionId" INTEGER,
ADD COLUMN     "approved" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Association_adhesionId_key" ON "Association"("adhesionId");

-- AddForeignKey
ALTER TABLE "Association" ADD CONSTRAINT "Association_adhesionId_fkey" FOREIGN KEY ("adhesionId") REFERENCES "Adhesion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
