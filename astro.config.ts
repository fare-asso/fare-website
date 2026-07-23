import { fileURLToPath } from "node:url"

import arkenv from "@arkenv/vite-plugin"
import node from "@astrojs/node"
import react from "@astrojs/react"
// oxlint-disable-next-line import/default
import sentry from "@sentry/astro"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"

import { EnvSchema } from "./src/env-schema"

export default defineConfig({
    output: "server",
    prefetch: {
        defaultStrategy: "hover",
        prefetchAll: true
    },
    adapter: node({ mode: "standalone" }),
    security: {
        // checkOrigin disabled: behind the TLS-terminating proxy the Node adapter
        // sees http internally, so its Origin/url.origin comparison rejects valid
        // form POSTs. Cross-site protection relies on Supabase SSR cookies
        // (SameSite=Lax).
        checkOrigin: false,
        actionBodySizeLimit: 100 * 1024 * 1024
    },
    integrations: [
        react({ babel: { plugins: ["babel-plugin-react-compiler"] } }),
        sentry({
            sourceMapsUploadOptions: {
                project: "fare-website",
                authToken: process.env.SENTRY_AUTH_TOKEN
            }
        })
    ],
    image: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ezatoworfypbxlvjkhud.supabase.co",
                pathname: "/storage/v1/object/public/**"
            },
            {
                protocol: "https",
                hostname: "supabase.fare.finxol.io",
                pathname: "/storage/v1/object/public/**"
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/a/**"
            }
        ]
    },
    redirects: {
        "/bouge-ta-prison/[...slug]": "/projets/bouge-ta-prison/[...slug]",
        "/bagadAsso/[...slug]": "/projets/bagad-asso/[...slug]",
        "/agorae/[...slug]": "/projets/agorae/[...slug]"
    },
    fonts: [
        {
            provider: fontProviders.fontsource(),
            name: "Ovo",
            cssVariable: "--font-ovo",
            weights: [400],
            styles: ["normal"],
            subsets: ["latin"]
        },
        {
            provider: fontProviders.local(),
            name: "ValleySans",
            cssVariable: "--font-valley-sans",
            options: {
                variants: [
                    {
                        src: ["./src/assets/fonts/ValleySans[wght].woff2"],
                        weight: "normal",
                        style: "normal"
                    }
                ]
            }
        }
    ],
    vite: {
        envPrefix: "PUBLIC_",
        plugins: [tailwindcss(), arkenv(EnvSchema, { emptyAsUndefined: true })],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
                "#public": fileURLToPath(new URL("./public", import.meta.url))
            }
        }
    }
})
