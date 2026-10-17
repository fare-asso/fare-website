-- AlterTable
ALTER TABLE "BagadAssoTicket" ADD COLUMN     "equipmentMigratedAt" TIMESTAMP(3),
ADD COLUMN     "equipmentRevision" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "equipments" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BagadAssoTicketEquipment" (
    "ticketId" INTEGER NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "requestedQuantity" INTEGER NOT NULL,
    "allocatedQuantity" INTEGER NOT NULL,
    "includedInContract" BOOLEAN DEFAULT false,

    CONSTRAINT "BagadAssoTicketEquipment_pkey" PRIMARY KEY ("ticketId","equipmentId")
);

-- CreateIndex
CREATE INDEX "BagadAssoTicketEquipment_equipmentId_idx" ON "BagadAssoTicketEquipment"("equipmentId");

-- AddForeignKey
ALTER TABLE "BagadAssoTicketEquipment" ADD CONSTRAINT "BagadAssoTicketEquipment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "BagadAssoTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BagadAssoTicketEquipment" ADD CONSTRAINT "BagadAssoTicketEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "BagadAssoEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
