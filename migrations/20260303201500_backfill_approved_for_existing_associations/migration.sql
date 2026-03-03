-- Backfill: set approved = NOW() for all existing associations that predate the approval workflow
UPDATE "Association" SET "approved" = NOW() WHERE "approved" IS NULL;
