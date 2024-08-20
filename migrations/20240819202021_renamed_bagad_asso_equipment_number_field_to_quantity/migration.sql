/*
  Warnings:

  - You are about to drop the column `number` on the `BagadAssoEquipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BagadAssoEquipment" DROP COLUMN "number",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
