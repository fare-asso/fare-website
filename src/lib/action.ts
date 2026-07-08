import * as Sentry from "@sentry/astro"

import { useLogger, withEvlog } from "@/lib/evlog"

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
