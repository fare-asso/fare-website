import { createJiti } from "jiti"

// Validate env at build time. Required because of Next.js pre-rendering
const jiti = createJiti(import.meta.url)
await jiti.import("./src/env")

/** @type {import('next').NextConfig} */
export default {
    output: "standalone",
    transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],

    reactCompiler: true,
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
                protocol: "https",
                hostname: "supabase.fare.finxol.io",
                port: "",
                pathname: "/storage/v1/object/public/**"
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                port: "",
                pathname: "/a/**"
            }
        ]
    },

    redirects() {
        return [
            {
                source: "/bouge-ta-prison/:slug*",
                destination: "/projets/bouge-ta-prison/:slug*",
                permanent: true
            },
            {
                source: "/bagadAsso/:slug*",
                destination: "/projets/bagad-asso/:slug*",
                permanent: true
            },
            {
                source: "/agorae/:slug*",
                destination: "/projets/agorae/:slug*",
                permanent: true
            }
        ]
    },

    /** We already do linting and typechecking as separate tasks in CI */
    typescript: { ignoreBuildErrors: true },

    devIndicators: false
}
