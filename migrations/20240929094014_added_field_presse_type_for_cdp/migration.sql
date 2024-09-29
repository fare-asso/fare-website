-- CreateEnum
CREATE TYPE "PresseType" AS ENUM ('CDP', 'DDP');

-- AlterTable
ALTER TABLE "CommuniqueDePresse" ADD COLUMN     "type" "PresseType" NOT NULL DEFAULT 'CDP';
