import { isWithServerActionCall } from "../ast.ts"
import type { Context, Node, Rule } from "../types.ts"

const TYPE_EXPORTS = new Set([
    "TSTypeAliasDeclaration",
    "TSInterfaceDeclaration",
    "TSEnumDeclaration",
    "TSModuleDeclaration"
])

function checkDeclaration(
    declaration: Node,
    context: Context,
    reportNode: Node
): void {
    if (TYPE_EXPORTS.has(declaration.type)) return

    if (declaration.type === "FunctionDeclaration") {
        context.report({ node: reportNode, messageId: "requireWrapper" })
        return
    }

    if (declaration.type === "VariableDeclaration") {
        for (const declarator of declaration.declarations ?? []) {
            const init = declarator.init
            if (!init || isWithServerActionCall(init)) continue
            if (
                init.type === "ArrowFunctionExpression" ||
                init.type === "FunctionExpression"
            ) {
                context.report({
                    node: declarator,
                    messageId: "requireWrapper"
                })
            }
        }
    }
}

const rule: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                'Every export of a `"use server"` file must be wrapped with `withServerAction()`.'
        },
        messages: {
            requireWrapper:
                'Server actions must be wrapped with `withServerAction("name", impl)` ' +
                "from `@/lib/sentry` and exported as the wrapped value (default or named). " +
                "See CLAUDE.md > Architecture Patterns > Server Actions."
        }
    },
    create(context) {
        return {
            Program(node) {
                const body = node.body ?? []
                const isServerActionFile = body.some(
                    (statement) =>
                        statement.type === "ExpressionStatement" &&
                        statement.directive === "use server"
                )
                if (!isServerActionFile) return

                for (const statement of body) {
                    if (statement.type === "ExportDefaultDeclaration") {
                        if (!isWithServerActionCall(statement.declaration)) {
                            context.report({
                                node: statement,
                                messageId: "requireWrapper"
                            })
                        }
                        continue
                    }
                    if (
                        statement.type === "ExportNamedDeclaration" &&
                        statement.declaration
                    ) {
                        checkDeclaration(
                            statement.declaration,
                            context,
                            statement
                        )
                    }
                }
            }
        }
    }
}

export default rule
