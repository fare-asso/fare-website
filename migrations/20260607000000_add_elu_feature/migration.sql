-- CreateTable
CREATE TABLE "Instance" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "description" TEXT,
    "logoPaths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Instance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conseil" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "instanceId" INTEGER NOT NULL,

    CONSTRAINT "Conseil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Elu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "conseilId" INTEGER NOT NULL,

    CONSTRAINT "Elu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conseil_instanceId_idx" ON "Conseil"("instanceId");

-- CreateIndex
CREATE INDEX "Elu_conseilId_idx" ON "Elu"("conseilId");

-- AddForeignKey
ALTER TABLE "Conseil" ADD CONSTRAINT "Conseil_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elu" ADD CONSTRAINT "Elu_conseilId_fkey" FOREIGN KEY ("conseilId") REFERENCES "Conseil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

