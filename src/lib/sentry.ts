import * as Sentry from "@sentry/nextjs"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

import { useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

type WithServerActionOptions = {
    attachFormData?: boolean
}

// Carries a Next redirect()/notFound() throw past withEvlog so it is not logged
// as a 500.
const CONTROL_FLOW = Symbol("evlog.controlFlow")

function isNextControlFlow(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false
    const digest = (error as { digest?: unknown }).digest
    return (
        typeof digest === "string" &&
        (digest.startsWith("NEXT_REDIRECT") ||
            digest.startsWith("NEXT_NOT_FOUND"))
    )
}

function isControlFlowResult(
    result: unknown
): result is { [CONTROL_FLOW]: Error } {
    return (
        typeof result === "object" && result !== null && CONTROL_FLOW in result
    )
}

export function withServerAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>,
    options: WithServerActionOptions = {}
): (...args: A) => Promise<R> {
    const instrumented = withEvlog(
        async (...args: A): Promise<R | { [CONTROL_FLOW]: Error }> => {
            const log = useLogger()
            log.set({ action: name })

            // `{ value }` wrap stops tryCatch unwrapping a {data,error} shape.
            const settled = await tryCatch(async () => ({
                value: await handler(...args)
            }))
            if (!settled.success) {
                if (isNextControlFlow(settled.error)) {
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
        let formData: FormData | undefined
        if (options.attachFormData) {
            for (const arg of args) {
                if (
                    typeof arg === "object" &&
                    arg !== null &&
                    arg instanceof FormData
                ) {
                    formData = arg
                    break
                }
            }
        }

        const headerResult = await tryCatch(headers())
        const requestHeaders = headerResult.success
            ? headerResult.value
            : undefined

        const result = await Sentry.withServerActionInstrumentation(
            name,
            {
                ...(requestHeaders ? { headers: requestHeaders } : {}),
                ...(formData ? { formData } : {}),
                recordResponse: false
            },
            () => instrumented(...args)
        )

        if (isControlFlowResult(result)) {
            throw result[CONTROL_FLOW]
        }
        return result
    }
}

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>,
    rethrow = true
): void {
    if (rethrow) unstable_rethrow(error)
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
