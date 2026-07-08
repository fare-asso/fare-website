import * as Sentry from "@sentry/astro"
import type { ActionAPIContext } from "astro:actions"

import { useLogger, withEvlog } from "@/lib/evlog"

export function wrapAction<I, R>(
    name: string,
    handler: (input: I, context: ActionAPIContext) => Promise<R>
): (input: I, context?: ActionAPIContext) => Promise<R> {
    const instrumented = withEvlog(
        async (input: I, context: ActionAPIContext): Promise<R> => {
            const log = useLogger()
            log.set({ action: name })
            const result = await handler(input, context)
            if (result && typeof result === "object" && "success" in result) {
                log.set({ success: (result as { success: unknown }).success })
            }
            return result
        }
    )

    return (input: I, context?: ActionAPIContext) =>
        Sentry.startSpan({ name, op: "action" }, () =>
            instrumented(input, context as ActionAPIContext)
        )
}
