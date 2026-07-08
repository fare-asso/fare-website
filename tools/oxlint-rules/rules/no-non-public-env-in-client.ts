import type { Node, Rule } from "../types.ts"

const CLIENT_DIRS = ["/src/components/", "/src/hooks/"]
const VITE_BUILTINS = new Set([
    "MODE",
    "BASE_URL",
    "PROD",
    "DEV",
    "SSR",
    "SITE",
    "ASSETS_PREFIX"
])

function isEnvObject(node: Node | undefined): boolean {
    if (!node || node.type !== "MemberExpression") return false
    const { object, property } = node
    if (property?.type !== "Identifier" || property.name !== "env") {
        return false
    }
    return (
        object?.type === "MetaProperty" ||
        (object?.type === "Identifier" && object.name === "process")
    )
}

const rule: Rule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow non-PUBLIC_ environment variables in client-capable code."
        },
        messages: {
            nonPublicEnv:
                "Only PUBLIC_-prefixed env vars may be read in client code. " +
                "Server env belongs in actions, pages or server helpers.",
            serverEnvImport:
                "Do not import `@/env` in client code; it reads server-only env. " +
                "Use `import.meta.env.PUBLIC_*` instead."
        }
    },
    create(context) {
        if (!CLIENT_DIRS.some((dir) => context.filename.includes(dir))) {
            return {}
        }
        if (context.filename.includes("__tests__")) return {}
        return {
            Program(node) {
                for (const stmt of node.body ?? []) {
                    if (
                        stmt.type === "ImportDeclaration" &&
                        stmt.source?.value === "@/env"
                    ) {
                        context.report({
                            node: stmt,
                            messageId: "serverEnvImport"
                        })
                    }
                }
            },
            MemberExpression(node) {
                if (!isEnvObject(node.object)) return
                if (node.computed || node.property?.type !== "Identifier") {
                    return
                }
                const name = node.property.name ?? ""
                if (name.startsWith("PUBLIC_") || VITE_BUILTINS.has(name)) {
                    return
                }
                context.report({ node, messageId: "nonPublicEnv" })
            }
        }
    }
}

export default rule
