import type { Node, Rule } from "../types.ts"

function isOptionalNamed(member: Node, name: string): boolean {
    return (
        member.type === "TSPropertySignature" &&
        member.optional === true &&
        member.key?.type === "Identifier" &&
        member.key.name === name
    )
}

const rule: Rule = {
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
                const members = node.members ?? []
                const hasOptionalSuccess = members.some((member) =>
                    isOptionalNamed(member, "success")
                )
                if (!hasOptionalSuccess) return

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

export default rule
