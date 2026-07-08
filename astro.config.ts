import { fileURLToPath } from "node:url"

import arkenv from "@arkenv/vite-plugin"
import node from "@astrojs/node"
import react from "@astrojs/react"
// oxlint-disable-next-line import/default
import sentry from "@sentry/astro"
import tailwindcss from "@tailwindcss/vite"
import {
    defineConfig,
    fontProviders,
    passthroughImageService
} from "astro/config"

import { EnvSchema } from "./src/env-schema"

export default defineConfig({
    output: "server",
    adapter: node({ mode: "standalone" }),
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
        service: passthroughImageService(),
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
            name: "Inter",
            cssVariable: "--font-inter",
            weights: [400, 500, 600, 700],
            styles: ["normal"],
            subsets: ["latin"]
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
