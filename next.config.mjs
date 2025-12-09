import { createJiti } from "jiti"

const jiti = createJiti(import.meta.url, { debug: true })
await jiti.import("./app/env")

/** @type {import('next').NextConfig} */
export default {
    output: "standalone",
    transpilePackages: ["@t3-oss/env-nextjs", "@t3-oss/env-core"],
    experimental: {
        serverActions: {
            bodySizeLimit: "5mb"
        }
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ezatoworfypbxlvjkhud.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**"
            }
        ]
    }
}
