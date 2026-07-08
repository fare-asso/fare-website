import * as Sentry from "@sentry/astro"

import { wrapAction } from "@/lib/action"

// Legacy alias for not-yet-ported Next server actions; new code uses
// wrapAction from @/lib/action inside defineAction handlers.
export function withServerAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>,
    _options: { attachFormData?: boolean } = {}
): (...args: A) => Promise<R> {
    return wrapAction(name, handler)
}

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>
): void {
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
