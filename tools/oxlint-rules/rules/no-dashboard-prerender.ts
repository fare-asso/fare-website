import type { Rule } from "../types.ts"

const DASHBOARD_DIR = "/src/pages/dashboard/"

const rule: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow `export const prerender = true` in dashboard routes."
        },
        messages: {
            noPrerender:
                "Dashboard routes must stay on-demand (SSR): they read the " +
                "authenticated user and per-request data via the middleware. " +
                "Prerendering would bake user-scoped data into a static file at " +
                "build time. Remove `export const prerender = true`."
        }
    },
    create(context) {
        if (!context.filename.includes(DASHBOARD_DIR)) return {}
        return {
            Program(node) {
                for (const stmt of node.body ?? []) {
                    if (
                        stmt.type !== "ExportNamedDeclaration" ||
                        stmt.declaration?.type !== "VariableDeclaration"
                    ) {
                        continue
                    }
                    for (const d of stmt.declaration.declarations ?? []) {
                        if (
                            d.id?.name === "prerender" &&
                            d.init?.type === "Literal" &&
                            d.init.value === true
                        ) {
                            context.report({
                                node: d,
                                messageId: "noPrerender"
                            })
                        }
                    }
                }
            }
        }
    }
}

export default rule
