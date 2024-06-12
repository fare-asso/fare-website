-- CreateTable
CREATE TABLE "CommuniqueDePresse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,

    CONSTRAINT "CommuniqueDePresse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommuniqueDePresse_name_key" ON "CommuniqueDePresse"("name");
