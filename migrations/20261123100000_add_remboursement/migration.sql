-- CreateTable
CREATE TABLE "Remboursement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" TIMESTAMP(3),
    "demandeur" TEXT NOT NULL,
    "association" TEXT,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateVoyage" TIMESTAMP(3),
    "depart" TEXT,
    "arrivee" TEXT,
    "personnes" TEXT,
    "objet" TEXT,
    "montantTTC" TEXT,
    "folderPath" TEXT NOT NULL,
    "ribPath" TEXT NOT NULL,
    "justificatifsPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "piecesMetroBusPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "justificatifsPassagersPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Remboursement_pkey" PRIMARY KEY ("id")
);
