import { createEnv } from "@t3-oss/env-nextjs"
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

        DOKPLOY_DEPLOY_URL: z.string().optional()
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),

        NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
        NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY: z.string().min(1),
        NEXT_PUBLIC_SENTRY_DSN: z.string()
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

        NEXT_PUBLIC_SITE_URL:
            process.env.DOKPLOY_DEPLOY_URL || process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY:
            process.env.NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY,
        NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
    },

    emptyStringAsUndefined: true
})
