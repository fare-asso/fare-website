import type { Node, Rule } from "../types.ts"

const THROWING_BUILTINS = new Set(["JSON.parse"])

function builtinName(callee: Node | undefined): string | undefined {
    if (
        callee?.type === "MemberExpression" &&
        callee.computed === false &&
        callee.object?.type === "Identifier" &&
        callee.object.name !== undefined &&
        callee.property?.type === "Identifier" &&
        callee.property.name !== undefined
    ) {
        return `${callee.object.name}.${callee.property.name}`
    }
    return undefined
}

function isInsideTryCatch(node: Node): boolean {
    let current = node.parent
    while (current) {
        if (
            current.type === "CallExpression" &&
            current.callee?.type === "Identifier" &&
            current.callee.name === "tryCatch"
        ) {
            return true
        }
        current = current.parent
    }
    return false
}

const rule: Rule = {
    meta: {
        type: "suggestion",
        docs: {
            description:
                "Throwing built-ins (e.g. `JSON.parse`) must be wrapped with the `tryCatch` helper."
        },
        messages: {
            wrapThrowingBuiltin:
                "`JSON.parse` throws on invalid input. Wrap it with `tryCatch` from " +
                "`@/lib/utils` (e.g. `tryCatch(() => JSON.parse(x))`) and narrow on `success`."
        }
    },
    create(context) {
        return {
            CallExpression(node) {
                const name = builtinName(node.callee)
                if (
                    name !== undefined &&
                    THROWING_BUILTINS.has(name) &&
                    !isInsideTryCatch(node)
                ) {
                    context.report({ node, messageId: "wrapThrowingBuiltin" })
                }
            }
        }
    }
}

export default rule
