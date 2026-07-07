import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

const srcAlias = {
    "@": fileURLToPath(new URL("./src", import.meta.url))
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
    VITE_SUPABASE_URL: "http://localhost:54321",
    VITE_SUPABASE_ANON_KEY: "test-anon-key",
    VITE_SITE_URL: "http://localhost:3000",
    VITE_FRIENDLY_CAPTCHA_SITE_KEY: "test-site-key",
    VITE_SENTRY_DSN: "https://test@test.ingest.sentry.io/0"
}

// `@tanstack/react-start` needs the Start vite plugin's virtual modules, which
// the browser test project doesn't run; alias it to a stub whose
// `createServerFn` calls handlers directly.
const browserAlias = {
    ...srcAlias,
    "@tanstack/react-start/server": fileURLToPath(
        new URL("./src/test/stubs/tanstack-start-server.ts", import.meta.url)
    ),
    "@tanstack/react-start": fileURLToPath(
        new URL("./src/test/stubs/tanstack-start.ts", import.meta.url)
    )
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
                        "@tanstack/react-router",
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
