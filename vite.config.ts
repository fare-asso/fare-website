import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(async ({ mode }) => {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ""))
    // Validate env at build time (replaces the jiti import in next.config.mjs)
    await import("./src/env/server")
    await import("./src/env/client")

    return {
        server: {
            port: 3000
        },
        resolve: {
            tsconfigPaths: true
        },
        plugins: [
            tailwindcss(),
            tanstackStart({
                srcDirectory: "src",
                router: {
                    routesDirectory: "app"
                }
            }),
            viteReact({
                babel: {
                    plugins: ["babel-plugin-react-compiler"]
                }
            }),
            sentryTanstackStart({
                org: "fare-m2",
                project: "javascript-nextjs",
                authToken: process.env.SENTRY_AUTH_TOKEN,
                silent: !process.env.CI
            }),
            nitro()
        ]
    }
})
