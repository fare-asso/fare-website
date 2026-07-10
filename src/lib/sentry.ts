import * as Sentry from "@sentry/astro"

export function captureActionError(
    error: unknown,
    context?: Record<string, string | number | boolean>
): void {
    console.error(error)
    Sentry.captureException(error, context ? { extra: context } : undefined)
}
