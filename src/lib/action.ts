import * as Sentry from "@sentry/astro"

import { useLogger, withEvlog } from "@/lib/evlog"

// The returned action is registered via `defineAction` (which supplies the
// `ActionAPIContext` at call time) and invoked by tests with the input alone.
// Type the caller-facing signature with optional args so both call styles
// typecheck; the handler still receives whatever Astro passes through.
export function wrapAction<A extends unknown[], R>(
    name: string,
    handler: (...args: A) => Promise<R>
): (...args: Partial<A>) => Promise<R> {
    const instrumented = withEvlog(async (...args: A): Promise<R> => {
        const log = useLogger()
        log.set({ action: name })
        const result = await handler(...args)
        if (result && typeof result === "object" && "success" in result) {
            log.set({ success: (result as { success: unknown }).success })
        }
        return result
    })

    return ((...args: A) =>
        Sentry.startSpan({ name, op: "action" }, () =>
            instrumented(...args)
        )) as (...args: Partial<A>) => Promise<R>
}
