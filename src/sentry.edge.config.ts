import * as Sentry from "@sentry/nextjs"
import { isDevelopment } from "std-env"

Sentry.init({
    dsn: "https://32ebb0ac44a287a1add0b6dcc51185e0@o4511404536233984.ingest.de.sentry.io/4511404541083728",
    // Adds request headers and IP for users
    sendDefaultPii: true,
    // Capture 100% in dev, 10% in production
    // Adjust based on your traffic volume
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    // Enable logs to be sent to Sentry
    enableLogs: true
})
