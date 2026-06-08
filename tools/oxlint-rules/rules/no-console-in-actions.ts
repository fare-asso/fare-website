import type { Rule } from "../types.ts"

const rule: Rule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Disallow `console.error` in server actions; use `captureActionError`."
        },
        messages: {
            noConsoleError:
                "Do not use `console.error` in a server action. Report genuine exceptions " +
                "with `captureActionError(error)` from `@/lib/sentry`. " +
                "See CLAUDE.md > Code Style > Error Handling."
        }
    },
    create(context) {
        if (!context.filename.includes("/actions/")) return {}
        return {
            CallExpression(node) {
                const callee = node.callee
                if (
                    callee?.type === "MemberExpression" &&
                    callee.object?.type === "Identifier" &&
                    callee.object.name === "console" &&
                    callee.property?.type === "Identifier" &&
                    callee.property.name === "error"
                ) {
                    context.report({ node, messageId: "noConsoleError" })
                }
            }
        }
    }
}

export default rule
