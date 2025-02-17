-- CreateTable
CREATE TABLE "BTPTutorQuestion" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "studyYear" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BTPTutorQuestion_pkey" PRIMARY KEY ("id")
);
