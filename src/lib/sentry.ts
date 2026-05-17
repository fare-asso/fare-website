import * as Sentry from "@sentry/nextjs"
import { headers } from "next/headers"
import { unstable_rethrow } from "next/navigation"

type WithServerActionOptions = {
    attachFormData?: boolean
}

export function withServerAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>,
    options: WithServerActionOptions = {}
): (...args: A) => Promise<R> {
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

        let requestHeaders: Awaited<ReturnType<typeof headers>> | undefined
        try {
            requestHeaders = await headers()
        } catch {
            requestHeaders = undefined
        }

        return Sentry.withServerActionInstrumentation(
            name,
            {
                ...(requestHeaders ? { headers: requestHeaders } : {}),
                ...(formData ? { formData } : {}),
                recordResponse: false
            },
            () => handler(...args)
        )
    }
}

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>
): void {
    unstable_rethrow(error)
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
