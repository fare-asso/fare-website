/*
  Warnings:

  - Added the required column `email` to the `BTPTutorQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BTPTutorQuestion" ADD COLUMN     "email" TEXT NOT NULL;
