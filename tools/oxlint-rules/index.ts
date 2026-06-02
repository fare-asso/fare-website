type Ranged = { start: number; end: number }

interface TryStatementNode extends Ranged {
    type: "TryStatement"
    handler: (Ranged & { type: "CatchClause" }) | null
    finalizer: Ranged | null
}

interface TypeMember extends Ranged {
    type: string
    optional?: boolean
    key?: { type: string; name?: string }
}

interface TSTypeLiteralNode extends Ranged {
    type: "TSTypeLiteral"
    members: TypeMember[]
}

interface Context {
    id: string
    filename: string
    report(diagnostic: {
        node?: Ranged
        message?: string
        messageId?: string
    }): void
}

interface Rule {
    meta?: {
        type?: "problem" | "suggestion" | "layout"
        docs?: { description?: string }
        messages?: Record<string, string>
    }
    create(context: Context): {
        TryStatement?: (node: TryStatementNode) => void
        TSTypeLiteral?: (node: TSTypeLiteralNode) => void
    }
}

interface Plugin {
    meta?: { name?: string }
    rules: Record<string, Rule>
}

// --- Rule: local/no-try-catch -------------------------------------------
const noTryCatch: Rule = {
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
                "`success` flag. If this is intentional " +
                "best-effort cleanup, silence with " +
                "`// oxlint-disable-next-line local/no-try-catch`."
        }
    },
    create(context) {
        return {
            TryStatement(node) {
                // `try { ... } finally { ... }` (no catch) is cleanup-only —
                // not what this rule targets. Only flag try statements with a
                // catch handler.
                //
                // Report on the whole `TryStatement` (not just the handler)
                // so `// oxlint-disable-next-line local/no-try-catch` placed
                // above `try {` actually silences the warning.
                if (node.handler) {
                    context.report({ node, messageId: "preferTryCatch" })
                }
            }
        }
    }
}

// --- Rule: local/no-optional-result -------------------------------------
function isOptionalNamed(member: TypeMember, name: string): boolean {
    return (
        member.type === "TSPropertySignature" &&
        member.optional === true &&
        member.key?.type === "Identifier" &&
        member.key.name === name
    )
}

const noOptionalResult: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow optional `success?`/`error?` fields on action result types; " +
                "use a discriminated union `{ success: true; value } | { success: false; error }`."
        },
        messages: {
            preferDiscriminatedResult:
                "Action results must be a discriminated union " +
                "`{ success: true; value: T } | { success: false; error: string }`, not " +
                "an object with optional `success?`/`error?` fields. Callers narrow on " +
                "`success`, so it must always be present and literal."
        }
    },
    create(context) {
        return {
            TSTypeLiteral(node) {
                // Only flag object types that look like an action result: the
                // tell is an OPTIONAL `success` discriminant. A standalone
                // optional `error?` (e.g. a component prop) is left alone to
                // avoid false positives.
                const members = node.members
                const hasOptionalSuccess = members.some((member) =>
                    isOptionalNamed(member, "success")
                )
                if (!hasOptionalSuccess) {
                    return
                }

                for (const member of members) {
                    if (
                        isOptionalNamed(member, "success") ||
                        isOptionalNamed(member, "error")
                    ) {
                        context.report({
                            node: member,
                            messageId: "preferDiscriminatedResult"
                        })
                    }
                }
            }
        }
    }
}

// --- Plugin -------------------------------------------------------------
const plugin: Plugin = {
    meta: { name: "local" },
    rules: {
        "no-try-catch": noTryCatch,
        "no-optional-result": noOptionalResult
    }
}

export default plugin
