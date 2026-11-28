import * as Sentry from "@sentry/astro"

Sentry.init({
    dsn: import.meta.env.PUBLIC_SENTRY_DSN,
    // Only send events in production
    enabled: import.meta.env.PROD,
    dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: {
            request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
            response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] }
        },
        httpBodies: [],
        urlQueryParams: {
            deny: ["forwarded", "-ip", "remote-", "via", "-user"]
        },
        genAI: { inputs: false, outputs: false },
        databaseQueryData: false,
        graphQL: { document: false, variables: false }
    },
    // Capture 100% in dev, 10% in production
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0
})
