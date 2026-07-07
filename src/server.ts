import { wrapFetchWithSentry } from "@sentry/tanstackstart-react"
import handler, { createServerEntry } from "@tanstack/react-start/server-entry"

import { flushEvlog } from "@/lib/evlog.server"

// Flush buffered evlog events on shutdown.
process.once("SIGTERM", () => void flushEvlog())
process.once("SIGINT", () => void flushEvlog())

export default createServerEntry(
    wrapFetchWithSentry({
        fetch(request: Request) {
            return handler.fetch(request)
        }
    })
)
