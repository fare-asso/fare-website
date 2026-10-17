-- AlterTable
ALTER TABLE "BagadAssoEquipment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "BagadAssoTicket" DROP COLUMN "equipmentMigratedAt",
DROP COLUMN "equipments";
