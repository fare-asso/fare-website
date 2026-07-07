import * as Sentry from "@sentry/tanstackstart-react"
import { isNotFound, isRedirect } from "@tanstack/react-router"

import { useLogger, withEvlog } from "@/lib/evlog.server"
import { tryCatch } from "@/lib/utils"

// Carries a router redirect()/notFound() throw past withEvlog so it is not
// logged as a 500.
const CONTROL_FLOW = Symbol("evlog.controlFlow")

function isRouterControlFlow(error: unknown): boolean {
    return isRedirect(error) || isNotFound(error)
}

function isControlFlowResult(
    result: unknown
): result is { [CONTROL_FLOW]: unknown } {
    return (
        typeof result === "object" && result !== null && CONTROL_FLOW in result
    )
}

// Wraps a serverFn handler with a named Sentry span and evlog request logging
// (prod function ids are hashed, so the name cannot come from middleware).
// Use it inline in .handler(withServerAction("name", async ({ data }) => …))
// so the server code is stripped from the client bundle with the handler.
export function withServerAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>
): (...args: A) => Promise<R> {
    const instrumented = withEvlog(
        async (...args: A): Promise<R | { [CONTROL_FLOW]: unknown }> => {
            const log = useLogger()
            log.set({ action: name })

            // `{ value }` wrap stops tryCatch unwrapping a {data,error} shape.
            const settled = await tryCatch(async () => ({
                value: await handler(...args)
            }))
            if (!settled.success) {
                if (isRouterControlFlow(settled.error)) {
                    return { [CONTROL_FLOW]: settled.error }
                }
                throw settled.error
            }

            const { value } = settled.value
            if (value && typeof value === "object" && "success" in value) {
                log.set({ success: (value as { success: unknown }).success })
            }
            return value
        }
    )

    return async (...args: A): Promise<R> => {
        const result = await Sentry.startSpan(
            { name: `serverAction/${name}`, op: "function.server_action" },
            () => instrumented(...args)
        )

        if (isControlFlowResult(result)) {
            throw result[CONTROL_FLOW]
        }
        return result as R
    }
}

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>,
    rethrow = true
): void {
    if (rethrow && isRouterControlFlow(error)) throw error
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
