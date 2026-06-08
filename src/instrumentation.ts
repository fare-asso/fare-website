import * as Sentry from "@sentry/nextjs"
import { env } from "std-env"

export async function register() {
    if (env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config")

        // Flush buffered evlog events on shutdown (Next drains then exits).
        const { flushEvlog } = await import("./lib/evlog")
        process.once("SIGTERM", () => void flushEvlog())
        process.once("SIGINT", () => void flushEvlog())
    }
    if (env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config")
    }
}
// Capture errors from Server Components, middleware, and proxies
export const onRequestError = Sentry.captureRequestError
