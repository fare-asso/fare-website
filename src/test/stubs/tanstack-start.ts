// Browser-test stub for @tanstack/react-start: `createServerFn` becomes a
// plain builder that invokes the handler directly (no RPC bridge).
type ValidatorFn = (input: unknown) => unknown

function builder(state: { validator?: ValidatorFn }) {
    return {
        inputValidator: (validator: ValidatorFn) => builder({ validator }),
        validator: (validator: ValidatorFn) => builder({ validator }),
        middleware: () => builder(state),
        handler:
            (fn: (ctx: { data: unknown }) => unknown) =>
            (opts?: { data?: unknown }) =>
                fn({
                    data: state.validator
                        ? state.validator(opts?.data)
                        : opts?.data
                })
    }
}

export function createServerFn() {
    return builder({})
}
