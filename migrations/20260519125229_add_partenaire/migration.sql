-- CreateTable
CREATE TABLE "Partenaire" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoPath" TEXT NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id")
);
