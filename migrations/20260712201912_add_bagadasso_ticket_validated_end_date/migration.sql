-- AlterTable
ALTER TABLE "Adhesion" ALTER COLUMN "photosPaths" DROP DEFAULT;

-- AlterTable
ALTER TABLE "BagadAssoTicket" ADD COLUMN     "eventEndDate" TIMESTAMP(3),
ADD COLUMN     "validated" TIMESTAMP(3);
