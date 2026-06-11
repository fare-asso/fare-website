-- CreateTable
CREATE TABLE "LinkCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LinkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "LinkItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkItem_categoryId_idx" ON "LinkItem"("categoryId");

-- AddForeignKey
ALTER TABLE "LinkItem" ADD CONSTRAINT "LinkItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LinkCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
