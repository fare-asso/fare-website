-- CreateTable
CREATE TABLE "BagadAssoSuggestion" (
    "id" SERIAL NOT NULL,
    "equipmentName" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "referenceUrl" TEXT,
    "associationName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '',
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" TIMESTAMP(3),

    CONSTRAINT "BagadAssoSuggestion_pkey" PRIMARY KEY ("id")
);
