import { defineConfig } from "prisma/config"

import { loadDbUrl } from "./prisma/loadDbUrl"

export default defineConfig({
    schema: "schema.prisma",
    migrations: {
        path: "migrations",
        seed: "pnpm exec jiti ./prisma/seed.ts"
    },
    datasource: {
        // Migrations need a direct (non-pooled) connection — the pooled
        // SUPABASE_POSTGRES_PRISMA_URL goes through pgbouncer which does not
        // support the prepared statements Prisma Migrate relies on.
        url: loadDbUrl("SUPABASE_POSTGRES_PRISMA_DIRECT_URL")
    }
})
