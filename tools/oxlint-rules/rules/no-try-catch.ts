import type { Rule } from "../types.ts"

const rule: Rule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Disallow `try/catch`; use the `tryCatch` helper from `@/lib/utils` instead."
        },
        messages: {
            preferTryCatch:
                "Prefer the `tryCatch` helper from `@/lib/utils` over `try/catch`. " +
                "Wrap the promise with `await tryCatch(...)` and narrow on the returned " +
                "`success` flag. If this is intentional best-effort cleanup, silence with " +
                "`// oxlint-disable-next-line local/no-try-catch`."
        }
    },
    create(context) {
        return {
            TryStatement(node) {
                if (node.handler) {
                    context.report({ node, messageId: "preferTryCatch" })
                }
            }
        }
    }
}

export default rule
