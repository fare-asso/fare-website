type Ranged = { start: number; end: number }

interface TryStatementNode extends Ranged {
    type: "TryStatement"
    handler: (Ranged & { type: "CatchClause" }) | null
    finalizer: Ranged | null
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

// --- Plugin -------------------------------------------------------------
const plugin: Plugin = {
    meta: { name: "local" },
    rules: {
        "no-try-catch": noTryCatch
    }
}

export default plugin
