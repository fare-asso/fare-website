import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"

import { env } from "std-env"

/**
 * Prisma v7 no longer auto-loads `.env`, and the value resolved in
 * `prisma.config.ts` is not propagated to the spawned `db seed` process.
 * Read from the process environment first (Docker `ENV`, CI secrets),
 * then fall back to a local `.env` parsed with Node's native `parseEnv`
 */
export function loadDbUrl(varName: string): string | undefined {
    let url = env[varName]

    if (!url && existsSync("./.env")) {
        const parsed = parseEnv(readFileSync("./.env", "utf8"))
        url ||= parsed[varName] as string | undefined
    }

    return url
}
