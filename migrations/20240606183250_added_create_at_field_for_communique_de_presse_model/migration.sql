-- DropIndex
DROP INDEX "CommuniqueDePresse_name_key";

-- AlterTable
ALTER TABLE "CommuniqueDePresse" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
