-- CreateTable
CREATE TABLE "BagadAssoMaterial" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imagePath" TEXT,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BagadAssoMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BagadAssoTicket" (
    "id" SERIAL NOT NULL,
    "assocation" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "eventName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventAddr" TEXT NOT NULL,
    "estimatedParticipants" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BagadAssoTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BagadAssoMaterialToBagadAssoTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BagadAssoMaterialToBagadAssoTicket_AB_unique" ON "_BagadAssoMaterialToBagadAssoTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_BagadAssoMaterialToBagadAssoTicket_B_index" ON "_BagadAssoMaterialToBagadAssoTicket"("B");

-- AddForeignKey
ALTER TABLE "_BagadAssoMaterialToBagadAssoTicket" ADD CONSTRAINT "_BagadAssoMaterialToBagadAssoTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "BagadAssoMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BagadAssoMaterialToBagadAssoTicket" ADD CONSTRAINT "_BagadAssoMaterialToBagadAssoTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "BagadAssoTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
