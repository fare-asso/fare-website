-- CreateTable
CREATE TABLE "BTPTutorApplication" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "studyYear" TEXT NOT NULL,
    "mlPath" TEXT NOT NULL,
    "cvPath" TEXT NOT NULL,

    CONSTRAINT "BTPTutorApplication_pkey" PRIMARY KEY ("id")
);
