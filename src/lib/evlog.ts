import type { DrainContext } from "evlog"
import { createEvlog } from "evlog/next"
import { createDrainPipeline } from "evlog/pipeline"
import { createSentryDrain } from "evlog/sentry"

import { env } from "@/env"

// Wide-event logging for route handlers and server actions. `withEvlog` wraps a
// handler, emitting one event per request/action (timing, status, anything added
// via `useLogger().set`). The Sentry drain forwards events to Sentry > Explore >
// Logs. Batched through a pipeline so draining never blocks the response.
const drain = env.SENTRY_DSN
    ? createDrainPipeline<DrainContext>({
          batch: { size: 50, intervalMs: 5000 }
      })(createSentryDrain({ dsn: env.SENTRY_DSN }))
    : undefined

export const { withEvlog, useLogger, createError } = createEvlog({
    service: "fare-website",
    drain
})
