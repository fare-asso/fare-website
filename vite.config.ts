import babel from "@rolldown/plugin-babel"
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { createLogger, defineConfig, loadEnv } from "vite"

// Import-protection denials are by design here (server modules are mocked out
// of the client bundle; every action file imports server helpers). The plugin
// has no off switch, so filter its noise — real leaks still throw at runtime.
const logger = createLogger()
const warn = logger.warn.bind(logger)
logger.warn = (msg, options) => {
    if (msg.includes("[import-protection] Import denied")) return
    if (msg.includes("SOURCEMAP_BROKEN") && msg.includes("import-protection")) {
        return
    }
    warn(msg, options)
}

export default defineConfig(async ({ mode }) => {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ""))
    // Validate env at build time (replaces the jiti import in next.config.mjs)
    await import("./src/env.server")
    await import("./src/env/client")

    return {
        customLogger: logger,
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
                },
                // Server-only modules use the .server.ts naming convention
                // (the plugin's default client deny pattern); they are mocked
                // out of the client bundle and throw on accidental access.
                importProtection: {
                    behavior: "mock",
                    log: "once"
                }
            }),
            viteReact(),
            babel({ presets: [reactCompilerPreset()] }),
            sentryTanstackStart({
                org: "fare-m2",
                project: "javascript-nextjs",
                authToken: process.env.SENTRY_AUTH_TOKEN,
                silent: !process.env.CI
            }),
            nitro({
                routeRules: {
                    "/bouge-ta-prison/**": {
                        redirect: {
                            to: "/projets/bouge-ta-prison/**",
                            status: 301
                        }
                    },
                    "/bagadAsso/**": {
                        redirect: {
                            to: "/projets/bagad-asso/**",
                            status: 301
                        }
                    },
                    "/agorae/**": {
                        redirect: {
                            to: "/projets/agorae/**",
                            status: 301
                        }
                    }
                }
            })
        ]
    }
})
