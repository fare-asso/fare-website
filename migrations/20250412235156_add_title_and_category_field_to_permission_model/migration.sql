-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "category" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Permission';
