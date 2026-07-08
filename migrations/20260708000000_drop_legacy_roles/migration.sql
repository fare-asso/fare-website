-- Coerce any remaining legacy espace-asso roles to ADMIN before dropping them
UPDATE "public"."User" SET "role" = 'ADMIN' WHERE "role" IN ('MEMBER', 'ASSO_OWNER');

-- Recreate the Role enum without the legacy MEMBER / ASSO_OWNER values
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
