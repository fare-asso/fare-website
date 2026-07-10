import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Utility type that expands complex types (like intersections or mapped types)
 * into a simpler, more readable structure in tooltips and error messages.
 *
 * It helps improve developer experience by showing the final computed shape
 * of a type, making it easier to understand and debug. It doesn't change
 * the actual structure of the type, only how TypeScript displays it.
 *
 * @template T The type to prettify.
 *
 * @example
 * type A = { a: string };
 * type B = { b: number };
 * type C = A & B;
 *
 * // Without Prettify, hovering over 'myVar' might show 'C' or 'A & B'
 * declare const myVar: C;
 *
 * // With Prettify, hovering over 'myPrettyVar' will show '{ a: string; b: number }'
 * declare const myPrettyVar: Prettify<C>;
 */
export type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

type SyncResult<T, E> =
    | { success: true; value: T; error: null }
    | { success: false; value: null; error: E }

type AsyncResult<T, E> = Promise<Prettify<SyncResult<T, E>>>

type UnwrapValue<T> = [T] extends [{ data: unknown; error: unknown }]
    ? [Extract<T, { error: null }>] extends [{ data: infer D }]
        ? D
        : T
    : T

type UnwrapError<T> = [T] extends [{ data: unknown; error: unknown }]
    ? [Exclude<T, { error: null }>] extends [{ error: infer Err }]
        ? Err
        : never
    : never

function isResultShape(
    value: unknown
): value is { data: unknown; error: unknown } {
    return (
        typeof value === "object" &&
        value !== null &&
        "data" in value &&
        "error" in value
    )
}

function wrap<T, E>(value: T): SyncResult<UnwrapValue<T>, UnwrapError<T> | E> {
    if (isResultShape(value)) {
        if (value.error != null) {
            return {
                success: false,
                value: null,
                error: value.error as UnwrapError<T> | E
            }
        }
        return {
            success: true,
            value: value.data as UnwrapValue<T>,
            error: null
        }
    }
    return {
        success: true,
        value: value as unknown as UnwrapValue<T>,
        error: null
    }
}

/**
 * Wrap a Promise, sync thunk, or async thunk in a try/catch and return a
 * Rust-style discriminated-union Result instead of throwing.
 *
 * The result shape is identical across all input forms:
 *   - success: `{ success: true, value: T, error: null }`
 *   - failure: `{ success: false, value: null, error: E }`
 *
 * If the produced value looks like a `{ data, error }` result (e.g. a
 * Supabase call that returns `{ data, error: null } | { data: null, error }`
 * instead of throwing), the helper unwraps it: `data` becomes `value` on
 * success, `error` is surfaced as failure.
 *
 * Overloads:
 *   - `tryCatch(promise)` → `Promise<Result<T>>` — original async form.
 *   - `tryCatch(() => syncOp())` → `Result<T>` — sync thunk; throws are
 *     caught synchronously. Use anywhere a `try/catch` wrapped a sync
 *     expression (`JSON.parse`, `cookieStore.set`, `localStorage.…`).
 *   - `tryCatch(() => asyncOp())` → `Promise<Result<T>>` — async thunk;
 *     catches synchronous throws inside the thunk too.
 *
 * @example
 * // supabase — non-throwing { data, error } result is unwrapped
 * const r = await tryCatch(supabase.storage.from("x").upload(k, blob))
 * if (!r.success) { captureActionError(r.error); return ... }
 * // r.value is { id, path, fullPath } — no manual destructure needed
 *
 * @example
 * // async — Promise input
 * const r = await tryCatch(prisma.user.update({ ... }))
 * if (!r.success) {
 *   captureActionError(r.error)
 *   return { success: false, error: "..." }
 * }
 *
 * @example
 * // sync — fall back when parsing fails
 * const r = tryCatch(() => JSON.parse(value))
 * return r.success ? { json: r.value } : { string: value }
 *
 * @example
 * // sync side-effect, result intentionally unused
 * tryCatch(() => cookieStore.set({ name, value, ...options }))
 */
export function tryCatch<T, E = Error>(
    input: Promise<T>
): AsyncResult<UnwrapValue<T>, UnwrapError<T> | E>
export function tryCatch<T, E = Error>(
    input: () => Promise<T>
): AsyncResult<UnwrapValue<T>, UnwrapError<T> | E>
export function tryCatch<T, E = Error>(
    input: () => T
): SyncResult<UnwrapValue<T>, UnwrapError<T> | E>
export function tryCatch<T, E = Error>(
    input: Promise<T> | (() => T | Promise<T>)
):
    | SyncResult<UnwrapValue<T>, UnwrapError<T> | E>
    | AsyncResult<UnwrapValue<T>, UnwrapError<T> | E> {
    if (typeof input === "function") {
        let produced: T | Promise<T>
        // oxlint-disable-next-line local/no-try-catch
        try {
            produced = input()
        } catch (error) {
            return {
                success: false,
                value: null,
                error: error as UnwrapError<T> | E
            }
        }
        if (produced instanceof Promise) {
            return produced.then(
                (value) => wrap<T, E>(value),
                (
                    error: unknown
                ): SyncResult<UnwrapValue<T>, UnwrapError<T> | E> => ({
                    success: false,
                    value: null,
                    error: error as UnwrapError<T> | E
                })
            )
        }
        return wrap<T, E>(produced)
    }
    // Promise.resolve handles both real Promises and non-thenable inputs
    // (e.g. test mocks that return undefined where a Promise was expected).
    return Promise.resolve(input).then(
        (value) => wrap<T, E>(value),
        (error: unknown): SyncResult<UnwrapValue<T>, UnwrapError<T> | E> => ({
            success: false,
            value: null,
            error: error as UnwrapError<T> | E
        })
    )
}
