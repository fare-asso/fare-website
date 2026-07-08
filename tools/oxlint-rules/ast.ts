import type { Node } from "./types.ts"

export function isWithServerActionCall(node: Node | null | undefined): boolean {
    return (
        !!node &&
        node.type === "CallExpression" &&
        node.callee?.type === "Identifier" &&
        (node.callee.name === "withServerAction" ||
            node.callee.name === "wrapAction")
    )
}
