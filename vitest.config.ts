import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

// `astro:actions` is a virtual module the Astro integration provides at build
// time; alias it to a resolvable stub so tests can `vi.mock("astro:actions")`.
const srcAlias = {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "astro:actions": fileURLToPath(
        new URL("./src/test/stubs/astro-actions.ts", import.meta.url)
    )
}

const browserAlias = {
    ...srcAlias
}

const testEnv = {
    SUPABASE_POSTGRES_PRISMA_URL: "postgresql://test:test@localhost:5432/test",
    FRIENDLY_CAPTCHA_API_KEY: "test-fc-api-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    SMTP_HOST: "smtp.test.local",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "test-user",
    SMTP_PASS: "test-pass",
    SMTP_FROM_EMAIL: "noreply@fare-asso.fr",
    PUBLIC_SUPABASE_URL: "http://localhost:54321",
    PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    PUBLIC_SITE_URL: "http://localhost:3000",
    PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY: "test-site-key",
    PUBLIC_SENTRY_DSN: "https://test@test.ingest.sentry.io/0"
}

const browserTestGlob = "src/**/__tests__/**/*.browser.test.tsx"

export default defineConfig({
    resolve: { alias: srcAlias },
    test: {
        globals: false,
        env: testEnv,
        projects: [
            {
                resolve: { alias: srcAlias },
                test: {
                    name: "node",
                    environment: "node",
                    setupFiles: ["./vitest.setup.ts"],
                    env: testEnv,
                    include: [
                        "src/**/__tests__/**/*.test.ts",
                        "src/**/__tests__/**/*.test.tsx",
                        "emails/**/__tests__/**/*.test.tsx"
                    ],
                    exclude: [browserTestGlob]
                }
            },
            {
                resolve: { alias: browserAlias },
                plugins: [react()],
                optimizeDeps: {
                    include: [
                        "@supabase/ssr",
                        "@tanstack/react-table",
                        "lucide-react"
                    ]
                },
                test: {
                    name: "browser",
                    setupFiles: ["./vitest.browser.setup.ts"],
                    env: testEnv,
                    include: [browserTestGlob],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        headless: true,
                        instances: [{ browser: "chromium" }]
                    }
                }
            }
        ]
    }
})
