/*
  Warnings:

  - Changed the type of `content` on the `Article` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "writtenOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;
