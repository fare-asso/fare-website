type Ranged = { start: number; end: number }

export interface Node extends Ranged {
    type: string
    body?: Node[]
    declaration?: Node | null
    declarations?: Node[]
    specifiers?: Node[]
    members?: Node[]
    arguments?: Node[]
    id?: Node | null
    init?: Node | null
    name?: string
    value?: unknown
    optional?: boolean
    key?: Node
    callee?: Node
    object?: Node
    property?: Node
    computed?: boolean
    expression?: Node
    directive?: string
    handler?: Node | null
    finalizer?: Node | null
}

export interface Context {
    id: string
    filename: string
    report(diagnostic: {
        node?: Ranged
        message?: string
        messageId?: string
    }): void
}

interface Visitor {
    Program?(node: Node): void
    TryStatement?(node: Node): void
    TSTypeLiteral?(node: Node): void
    CallExpression?(node: Node): void
    VariableDeclarator?(node: Node): void
    MemberExpression?(node: Node): void
}

export interface Rule {
    meta?: {
        type?: "problem" | "suggestion" | "layout"
        docs?: { description?: string }
        messages?: Record<string, string>
    }
    create(context: Context): Visitor
}

export interface Plugin {
    meta?: { name?: string }
    rules: Record<string, Rule>
}
