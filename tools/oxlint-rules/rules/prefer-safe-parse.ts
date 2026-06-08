import type { Rule } from "../types.ts"

const rule: Rule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Prefer `.safeParse()` over `.parse()` so validation never throws."
        },
        messages: {
            preferSafeParse:
                "Validate with `.safeParse()` and narrow on `.success` instead of `.parse()`, " +
                "which throws on invalid input. See CLAUDE.md > Form Security."
        }
    },
    create(context) {
        return {
            CallExpression(node) {
                const callee = node.callee
                if (
                    callee?.type === "MemberExpression" &&
                    callee.computed === false &&
                    callee.property?.type === "Identifier" &&
                    (callee.property.name === "parse" ||
                        callee.property.name === "parseAsync") &&
                    !(
                        callee.object?.type === "Identifier" &&
                        callee.object.name === "JSON"
                    )
                ) {
                    context.report({ node, messageId: "preferSafeParse" })
                }
            }
        }
    }
}

export default rule
