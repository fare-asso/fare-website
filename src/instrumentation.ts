import * as Sentry from "@sentry/nextjs"
import { env } from "std-env"

export async function register() {
    if (env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config")
    }
    if (env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config")
    }
}
// Capture errors from Server Components, middleware, and proxies
export const onRequestError = Sentry.captureRequestError
