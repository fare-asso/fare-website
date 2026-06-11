import * as Sentry from "@sentry/nextjs"

export async function register() {
    // process.env.NEXT_RUNTIME is statically replaced at build time, so the
    // nodejs branch is tree-shaken from the edge bundle (std-env's `env` isn't).
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config")

        // Flush buffered evlog events on shutdown (Next drains then exits).
        const { flushEvlog } = await import("./lib/evlog")
        process.once("SIGTERM", () => void flushEvlog())
        process.once("SIGINT", () => void flushEvlog())
    }
    if (process.env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config")
    }
}
// Capture errors from Server Components, middleware, and proxies
export const onRequestError = Sentry.captureRequestError
