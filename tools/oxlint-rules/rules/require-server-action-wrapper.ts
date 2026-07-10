import { isWithServerActionCall } from "../ast.ts"
import type { Node, Rule } from "../types.ts"

const ACTIONS_DIR = "/src/actions/"

// An exported const initialiser that should have been wrapped but wasn't:
// an inline function, a call that isn't `wrapAction()`, or a bare `…Impl`
// identifier exported directly. Plain data consts and `wrapAction()` calls
// are fine; `fetch…` SSR helpers are function declarations, not consts.
function isUnwrappedAction(init: Node): boolean {
    return (
        init.type === "ArrowFunctionExpression" ||
        init.type === "FunctionExpression" ||
        (init.type === "CallExpression" && !isWithServerActionCall(init)) ||
        (init.type === "Identifier" && !!init.name?.endsWith("Impl"))
    )
}

const rule: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Every action exported from `src/actions/**` must be wrapped with `wrapAction()`."
        },
        messages: {
            requireWrapper:
                'Server actions must be wrapped with `wrapAction("name", impl)` ' +
                "from `@/lib/action` and exported as the wrapped value. " +
                "See CLAUDE.md > Architecture Patterns > Server Actions."
        }
    },
    create(context) {
        const filename = context.filename
        if (
            !filename.includes(ACTIONS_DIR) ||
            filename.includes("/__tests__/")
        ) {
            return {}
        }
        return {
            Program(node) {
                for (const statement of node.body ?? []) {
                    if (statement.type !== "ExportNamedDeclaration") continue
                    const declaration = statement.declaration
                    if (declaration?.type !== "VariableDeclaration") continue
                    for (const declarator of declaration.declarations ?? []) {
                        if (
                            declarator.init &&
                            isUnwrappedAction(declarator.init)
                        ) {
                            context.report({
                                node: declarator,
                                messageId: "requireWrapper"
                            })
                        }
                    }
                }
            }
        }
    }
}

export default rule
