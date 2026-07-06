import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
    server: {
        SUPABASE_POSTGRES_PRISMA_URL: z.string().min(1),

        FRIENDLY_CAPTCHA_API_KEY: z.string(),

        SUPABASE_SERVICE_ROLE_KEY: z.string(),

        SMTP_HOST: z.string(),
        SMTP_PORT: z.coerce.number().default(465),
        SMTP_SECURE: z.coerce.boolean().default(true),
        SMTP_USER: z.string(),
        SMTP_PASS: z.string(),
        SMTP_FROM_EMAIL: z.email(),

        SENTRY_DSN: z.string().optional(),

        DOKPLOY_DEPLOY_URL: z
            .string()
            .optional()
            .transform((val) => {
                if (!val) return undefined
                if (val.startsWith("https://")) return val
                return `https://${val}`
            })
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true
})
