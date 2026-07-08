import * as Sentry from "@sentry/nextjs"
import { isDevelopment } from "std-env"

import { env } from "./env"

Sentry.init({
    dsn: env.PUBLIC_SENTRY_DSN,
    // Only send events in production
    enabled: !isDevelopment,
    // Adds request headers and IP for users
    sendDefaultPii: true,
    // Capture 100% in dev, 10% in production
    // Adjust based on your traffic volume
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    // Enable logs to be sent to Sentry
    enableLogs: true
})
