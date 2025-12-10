import { createJiti } from "jiti"

// Validate env at build time. Required because of Next.js pre-rendering
const jiti = createJiti(import.meta.url)
await jiti.import("./src/env")

/** @type {import('next').NextConfig} */
export default {
    output: "standalone",
    transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb",
            reactCompiler: true
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ezatoworfypbxlvjkhud.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**"
            },
            {
                protocol: "http",
                hostname:
                    "fare-website-supabase-52fea5-188-34-191-34.traefik.me",
                port: "",
                pathname: "/storage/v1/object/public/**"
            }
        ]
    },

    /** We already do linting and typechecking as separate tasks in CI */
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    devIndicators: false
}
