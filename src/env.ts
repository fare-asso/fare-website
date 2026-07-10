import { createEnv } from "arkenv"

import { EnvSchema } from "./env-schema"

// Merge Vite's dev-time env (.env files) with runtime process.env so secrets
// provided at container runtime are never baked in at build time.
const runtimeEnv: Record<string, string | undefined> = {}
for (const [key, value] of Object.entries({
    ...import.meta.env,
    ...process.env
})) {
    if (typeof value === "string") runtimeEnv[key] = value
}

export const env = createEnv(EnvSchema, {
    env: runtimeEnv,
    emptyAsUndefined: true
})
