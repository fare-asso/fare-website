import { resolve } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"
import {
    backfillTicketEquipment,
    type BackfillDatabase
} from "../src/helpers/bagadAsso/backfillTicketEquipment"
import { tryCatch } from "../src/lib/utils"
import { loadDbUrl } from "./loadDbUrl"

const usage =
    "Usage: upm exec jiti prisma/backfillBagadTicketEquipment.ts --target=HOST:PORT/DATABASE [--apply] [--fill-missing-equipment]"

type CliOptions = {
    target: string
    apply: boolean
    fillMissingEquipment: boolean
}
type CliDatabase = BackfillDatabase & { $disconnect(): Promise<void> }
export type BackfillCliDependencies = {
    loadUrl(): string | undefined
    createDatabase(connectionString: string): CliDatabase
    write(message: string): void
}

export function parseBackfillArguments(argv: string[]): CliOptions {
    let target: string | undefined
    let apply = false
    let fillMissingEquipment = false
    for (const arg of argv) {
        if (arg === "--apply" && !apply) {
            apply = true
        } else if (
            arg === "--fill-missing-equipment" &&
            !fillMissingEquipment
        ) {
            fillMissingEquipment = true
        } else if (arg.startsWith("--target=") && target === undefined) {
            target = arg.slice("--target=".length)
        } else {
            throw new Error("invalid-arguments")
        }
    }
    // A target is a literal host:port/database, never a URL or credentials.
    if (
        !target ||
        !/^[a-zA-Z0-9.-]+:[0-9]{1,5}\/[a-zA-Z0-9_-]+$/.test(target)
    ) {
        throw new Error("invalid-target")
    }
    return { target, apply, fillMissingEquipment }
}

export function validateBackfillTarget(
    connectionString: string,
    target: string
): void {
    const url = new URL(connectionString)
    if (
        !["postgres:", "postgresql:"].includes(url.protocol) ||
        !url.hostname ||
        url.hash ||
        `${url.hostname}:${url.port || "5432"}/${decodeURIComponent(url.pathname.slice(1))}` !==
            target
    ) {
        throw new Error("target-mismatch")
    }
    // Reject alternate connection-routing parameters that could defeat the
    // literal target check. Add options here only after checking pg semantics.
    const allowedParameters = new Set([
        "sslmode",
        "sslcert",
        "sslkey",
        "sslrootcert",
        "connect_timeout",
        "application_name",
        "schema"
    ])
    for (const key of url.searchParams.keys()) {
        if (!allowedParameters.has(key)) {
            throw new Error("unsupported-connection-parameter")
        }
    }
}

const defaultDependencies: BackfillCliDependencies = {
    loadUrl: (): string | undefined =>
        loadDbUrl("SUPABASE_POSTGRES_PRISMA_DIRECT_URL"),
    createDatabase: (connectionString): CliDatabase =>
        new PrismaClient({ adapter: new PrismaPg({ connectionString }) }),
    write: (message): void => console.log(message)
}

/** Exported for tests; importing this file never loads a URL or opens a DB. */
export async function runBackfillCli(
    argv: string[],
    dependencies: BackfillCliDependencies = defaultDependencies
): Promise<number> {
    if (argv.length === 1 && argv[0] === "--help") {
        dependencies.write(usage)
        return 0
    }
    const options = tryCatch(() => parseBackfillArguments(argv))
    if (!options.success) {
        dependencies.write(usage)
        return 1
    }
    const connection = tryCatch(() => {
        const url = dependencies.loadUrl()
        if (!url) throw new Error("missing-direct-url")
        validateBackfillTarget(url, options.value.target)
        return url
    })
    if (!connection.success) {
        dependencies.write(
            "Direct URL missing/invalid, unsupported connection parameters, or target mismatch. No connection opened."
        )
        return 1
    }
    const client = tryCatch(() => dependencies.createDatabase(connection.value))
    if (!client.success) {
        dependencies.write("Unable to initialize database client.")
        return 1
    }
    const result = await tryCatch(() =>
        backfillTicketEquipment(client.value, {
            apply: options.value.apply,
            fillMissingEquipment: options.value.fillMissingEquipment
        })
    )
    const disconnected = await tryCatch(() => client.value.$disconnect())
    if (!result.success) {
        dependencies.write("Backfill failed. Re-run dry-run before resuming.")
        return 1
    }
    dependencies.write(JSON.stringify(result.value, null, 2))
    if (!disconnected.success) {
        dependencies.write("Database disconnect failed.")
        return 1
    }
    return result.value.success ? 0 : 1
}

if (
    process.argv[1] &&
    import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
    const result = await tryCatch(() => runBackfillCli(process.argv.slice(2)))
    if (result.success) {
        process.exitCode = result.value
    } else {
        console.error("Backfill failed; no connection details are logged.")
        process.exitCode = 1
    }
}
