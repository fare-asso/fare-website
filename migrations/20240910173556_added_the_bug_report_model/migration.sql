-- CreateTable
CREATE TABLE "BugReport" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'autre',
    "description" TEXT NOT NULL,

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);
