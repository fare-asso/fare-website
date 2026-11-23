import * as Sentry from "@sentry/astro"
import type { ActionAPIContext } from "astro:actions"

export type ActionResult<T = void> = [T] extends [void]
    ? { success: true } | { success: false; error: string }
    : { success: true; value: T } | { success: false; error: string }

export function instrumentAction<I, R>(
    handler: (input: I, context: ActionAPIContext) => Promise<R>
): (input: I, context: ActionAPIContext) => Promise<R> {
    const name = handler.name || "action"
    return (input: I, context: ActionAPIContext) =>
        Sentry.startSpan({ name, op: "action" }, async () => {
            const log = context?.locals?.log
            log?.set({ action: name })
            const result = await handler(input, context)
            if (result && typeof result === "object" && "success" in result) {
                log?.set({ success: (result as { success: unknown }).success })
            }
            return result
        })
}
