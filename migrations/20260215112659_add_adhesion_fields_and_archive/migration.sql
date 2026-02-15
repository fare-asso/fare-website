-- AlterTable
ALTER TABLE "Adhesion" ADD COLUMN     "adresseAdministrative" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "archived" TIMESTAMP(3),
ADD COLUMN     "bureau" JSONB,
ADD COLUMN     "college" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dateAG" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nomComplet" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nombreAdherents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nombreEtudiantsRepresentes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "objetPrincipal" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sigle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "telephoneFixe" TEXT,
ADD COLUMN     "telephonePortable" TEXT NOT NULL DEFAULT '';
