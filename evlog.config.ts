import { defineEvlog, type DrainContext } from "evlog"
import { createDrainPipeline } from "evlog/pipeline"
import { createSentryDrain } from "evlog/sentry"

import { env } from "@/env"

const drain = env.SENTRY_DSN
    ? createDrainPipeline<DrainContext>({
          batch: { size: 50, intervalMs: 5000 }
      })(createSentryDrain({ dsn: env.SENTRY_DSN }))
    : undefined

export default defineEvlog({
    service: "fare-website",
    drain
})
