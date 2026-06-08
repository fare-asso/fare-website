import type { Node, Rule } from "../types.ts"

const BUILTIN_PARSE = new Set(["JSON", "Date", "path"])

function isBuiltinParse(object: Node | undefined): boolean {
    return (
        object?.type === "Identifier" &&
        object.name !== undefined &&
        BUILTIN_PARSE.has(object.name)
    )
}

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
                    !isBuiltinParse(callee.object)
                ) {
                    context.report({ node, messageId: "preferSafeParse" })
                }
            }
        }
    }
}

export default rule
