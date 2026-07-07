import {
    sentryGlobalFunctionMiddleware,
    sentryGlobalRequestMiddleware
} from "@sentry/tanstackstart-react"
import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

// Defining a custom start instance disables the default CSRF protection, so
// re-add it explicitly.
const csrfMiddleware = createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === "serverFn"
})

export const startInstance = createStart(() => ({
    requestMiddleware: [sentryGlobalRequestMiddleware, csrfMiddleware],
    functionMiddleware: [sentryGlobalFunctionMiddleware]
}))
