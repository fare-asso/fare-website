import * as Sentry from "@sentry/astro"

Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN,
    // Only send events in production
    enabled: import.meta.env.PROD,
    // Adds request headers and IP for users
    sendDefaultPii: true,
    // Capture 100% in dev, 10% in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Enable logs to be sent to Sentry
    enableLogs: true,
    integrations: [Sentry.replayIntegration()],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
})
