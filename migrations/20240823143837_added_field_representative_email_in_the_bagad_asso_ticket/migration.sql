/*
  Warnings:

  - You are about to drop the column `mail` on the `BagadAssoTicket` table. All the data in the column will be lost.
  - Added the required column `associationEmail` to the `BagadAssoTicket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `representativeEmail` to the `BagadAssoTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BagadAssoTicket" DROP COLUMN "mail",
ADD COLUMN     "associationEmail" TEXT NOT NULL,
ADD COLUMN     "representativeEmail" TEXT NOT NULL;
