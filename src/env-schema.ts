import { type } from "arkenv"

export const EnvSchema = type({
    SUPABASE_POSTGRES_PRISMA_URL: "string > 0",

    FRIENDLY_CAPTCHA_API_KEY: "string",

    SUPABASE_SERVICE_ROLE_KEY: "string",
    SUPABASE_ANON_KEY: "string",

    SMTP_HOST: "string",
    SMTP_PORT: "number = 465",
    SMTP_SECURE: "boolean = true",
    SMTP_USER: "string",
    SMTP_PASS: "string",
    SMTP_FROM_EMAIL: "string.email",

    "SENTRY_DSN?": "string",

    "DOKPLOY_DEPLOY_URL?": type("string").pipe((val) =>
        val.startsWith("https://") ? val : `https://${val}`
    ),

    PUBLIC_SUPABASE_URL: "string.url",

    PUBLIC_SITE_URL: 'string.url = "http://localhost:3000"',
    PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY: "string > 0",
    "PUBLIC_SENTRY_DSN?": "string"
})
