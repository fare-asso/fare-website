import {
    init,
    captureRouterTransitionStart,
    replayIntegration
} from "@sentry/nextjs"
import { isDevelopment } from "std-env"

import { env } from "./env"

init({
    dsn: env.VITE_SENTRY_DSN,
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
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
})

// This export will instrument router navigations
export const onRouterTransitionStart = captureRouterTransitionStart
