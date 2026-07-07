import * as Sentry from "@sentry/tanstackstart-react"

const isDevelopment = process.env.NODE_ENV === "development"

Sentry.init({
    dsn: process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN,
    // Only send events in production
    enabled: !isDevelopment,
    // Adds request headers and IP for users
    sendDefaultPii: true,
    // Capture 100% in dev, 10% in production
    tracesSampleRate: isDevelopment ? 1.0 : 0.1,
    // Enable logs to be sent to Sentry
    enableLogs: true
})
