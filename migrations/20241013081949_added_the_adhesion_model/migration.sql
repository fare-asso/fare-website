-- CreateTable
CREATE TABLE "Adhesion" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "association" TEXT NOT NULL,
    "folderPath" TEXT NOT NULL,

    CONSTRAINT "Adhesion_pkey" PRIMARY KEY ("id")
);
