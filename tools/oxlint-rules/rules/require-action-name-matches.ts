import { isWithServerActionCall } from "../ast.ts"
import type { Rule } from "../types.ts"

const rule: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "The `withServerAction` trace name must match the wrapped impl (minus `Impl`)."
        },
        messages: {
            nameMismatch:
                "The `withServerAction` trace name must match the wrapped function name " +
                "(without its `Impl` suffix). See CLAUDE.md > Server Actions."
        }
    },
    create(context) {
        return {
            CallExpression(node) {
                if (!isWithServerActionCall(node)) return
                const args = node.arguments ?? []
                const nameArg = args[0]
                const implArg = args[1]
                if (
                    nameArg?.type === "Literal" &&
                    typeof nameArg.value === "string" &&
                    implArg?.type === "Identifier" &&
                    typeof implArg.name === "string"
                ) {
                    const expected = implArg.name.replace(/Impl$/, "")
                    if (expected !== nameArg.value) {
                        context.report({
                            node: nameArg,
                            messageId: "nameMismatch"
                        })
                    }
                }
            }
        }
    }
}

export default rule
