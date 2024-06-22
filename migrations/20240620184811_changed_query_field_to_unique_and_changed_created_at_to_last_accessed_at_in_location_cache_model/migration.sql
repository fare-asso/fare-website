/*
  Warnings:

  - You are about to drop the column `createdAt` on the `LocationCache` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[query]` on the table `LocationCache` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LocationCache" DROP COLUMN "createdAt",
ADD COLUMN     "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "LocationCache_query_key" ON "LocationCache"("query");
