-- CreateTable
CREATE TABLE "LocationCache" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "response" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationCache_pkey" PRIMARY KEY ("id")
);
