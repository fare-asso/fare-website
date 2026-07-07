import { init, replayIntegration } from "@sentry/tanstackstart-react"
import { isDevelopment } from "std-env"

import { clientEnv } from "@/env/client"

init({
    dsn: clientEnv.VITE_SENTRY_DSN,
    // Only send events in production
    enabled: !isDevelopment,
    // Adds request headers and IP for users
    sendDefaultPii: true,
    // Capture 100% in dev, 10% in production
    // Adjust based on your traffic volume
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    // Enable logs to be sent to Sentry
    enableLogs: true,

    integrations: [replayIntegration()],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
})
