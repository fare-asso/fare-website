import type { DrainContext } from "evlog"
import { createEvlog } from "evlog/next"
import { createDrainPipeline } from "evlog/pipeline"
import { createSentryDrain } from "evlog/sentry"

import { env } from "@/env"

const drain = env.SENTRY_DSN
    ? createDrainPipeline<DrainContext>({
          batch: { size: 50, intervalMs: 5000 }
      })(createSentryDrain({ dsn: env.SENTRY_DSN }))
    : undefined

export const { withEvlog, useLogger, createError } = createEvlog({
    service: "fare-website",
    drain
})
