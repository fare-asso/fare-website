import babel from "@rolldown/plugin-babel"
import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react"
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
                },
                // Server-only modules reachable from client-imported action
                // files are mocked out of the client bundle (access throws)
                // instead of failing the build.
                importProtection: {
                    behavior: "mock",
                    client: {
                        specifiers: [
                            "@tanstack/react-start/server",
                            "@/helpers/db",
                            "@/helpers/supabase/server",
                            "@/helpers/email",
                            "@/env/server",
                            "@/lib/evlog"
                        ]
                    }
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
