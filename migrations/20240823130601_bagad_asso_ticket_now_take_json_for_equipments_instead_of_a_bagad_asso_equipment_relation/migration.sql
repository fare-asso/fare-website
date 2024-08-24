/*
  Warnings:

  - You are about to drop the `_BagadAssoEquipmentToBagadAssoTicket` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `equipments` to the `BagadAssoTicket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_BagadAssoEquipmentToBagadAssoTicket" DROP CONSTRAINT "_BagadAssoEquipmentToBagadAssoTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_BagadAssoEquipmentToBagadAssoTicket" DROP CONSTRAINT "_BagadAssoEquipmentToBagadAssoTicket_B_fkey";

-- AlterTable
ALTER TABLE "BagadAssoTicket" ADD COLUMN     "equipments" JSONB NOT NULL;

-- DropTable
DROP TABLE "_BagadAssoEquipmentToBagadAssoTicket";
