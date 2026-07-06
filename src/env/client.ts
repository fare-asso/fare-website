import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const clientEnv = createEnv({
    clientPrefix: "VITE_",
    client: {
        VITE_SUPABASE_URL: z.url(),
        VITE_SUPABASE_ANON_KEY: z.string(),

        VITE_SITE_URL: z.url().default("http://localhost:3000"),
        VITE_FRIENDLY_CAPTCHA_SITE_KEY: z.string().min(1),
        VITE_SENTRY_DSN: z.string()
    },
    runtimeEnv:
        typeof import.meta.env === "undefined" ? process.env : import.meta.env,
    emptyStringAsUndefined: true
})
