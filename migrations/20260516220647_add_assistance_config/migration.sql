-- CreateTable
CREATE TABLE "AssistanceConfig" (
    "id" SERIAL NOT NULL,
    "recipientEmail" TEXT NOT NULL DEFAULT 'defense-des-droits@fare-asso.fr',
    "delay" TEXT NOT NULL DEFAULT '48h',

    CONSTRAINT "AssistanceConfig_pkey" PRIMARY KEY ("id")
);
