-- AlterTable
ALTER TABLE "Adhesion" ADD COLUMN     "bilanFinancierPath" TEXT,
ADD COLUMN     "engagementCotisation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extraitPVPath" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "filiere" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lettreEngagementPath" TEXT,
ADD COLUMN     "logoPath" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "numeroSalle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recepissePath" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "reglementInterieurPath" TEXT,
ADD COLUMN     "siegeSocial" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "statutsPath" TEXT NOT NULL DEFAULT '';
