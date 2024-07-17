/*
  Warnings:

  - You are about to drop the `BagadAssoMaterial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BagadAssoMaterialToBagadAssoTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BagadAssoMaterialToBagadAssoTicket" DROP CONSTRAINT "_BagadAssoMaterialToBagadAssoTicket_A_fkey";

-- DropForeignKey
ALTER TABLE "_BagadAssoMaterialToBagadAssoTicket" DROP CONSTRAINT "_BagadAssoMaterialToBagadAssoTicket_B_fkey";

-- DropTable
DROP TABLE "BagadAssoMaterial";

-- DropTable
DROP TABLE "_BagadAssoMaterialToBagadAssoTicket";

-- CreateTable
CREATE TABLE "BagadAssoEquipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BagadAssoEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BagadAssoEquipmentToBagadAssoTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BagadAssoEquipmentToBagadAssoTicket_AB_unique" ON "_BagadAssoEquipmentToBagadAssoTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_BagadAssoEquipmentToBagadAssoTicket_B_index" ON "_BagadAssoEquipmentToBagadAssoTicket"("B");

-- AddForeignKey
ALTER TABLE "_BagadAssoEquipmentToBagadAssoTicket" ADD CONSTRAINT "_BagadAssoEquipmentToBagadAssoTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "BagadAssoEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BagadAssoEquipmentToBagadAssoTicket" ADD CONSTRAINT "_BagadAssoEquipmentToBagadAssoTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "BagadAssoTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
