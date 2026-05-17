import { defineConfig } from "vitest/config"

export default defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
        environment: "node",
        globals: false,
        setupFiles: ["./vitest.setup.ts"],
        include: [
            "src/**/*.test.ts",
            "src/**/*.test.tsx",
            "emails/**/*.test.tsx"
        ],
        env: {
            FRIENDLY_CAPTCHA_API_KEY: "test-fc-api-key",
            SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
            SMTP_HOST: "smtp.test.local",
            SMTP_PORT: "465",
            SMTP_SECURE: "true",
            SMTP_USER: "test-user",
            SMTP_PASS: "test-pass",
            SMTP_FROM_EMAIL: "noreply@fare-asso.fr",
            NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
            NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
            NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
            NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY: "test-site-key",
            NEXT_PUBLIC_SENTRY_DSN: "https://test@test.ingest.sentry.io/0"
        }
    }
})
