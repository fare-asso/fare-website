// Resolvable stand-in for the `astro:actions` virtual module so tests can
// `vi.mock("astro:actions", ...)`. Component tests replace `actions` with
// their own spies; the defaults below are only used if a test forgets to.
export const actions = {}

export function isInputError(_error: unknown): boolean {
    return false
}

export class ActionError extends Error {
    code: string
    constructor(opts: { code: string; message?: string }) {
        super(opts.message ?? opts.code)
        this.code = opts.code
    }
}
