import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type SyncResult<T, E> =
    | { success: true; value: T; error: null }
    | { success: false; value: null; error: E }

type AsyncResult<T, E> = Promise<SyncResult<T, E>>

/**
 * Wrap a Promise, sync thunk, or async thunk in a try/catch and return a
 * Rust-style discriminated-union Result instead of throwing.
 *
 * The result shape is identical across all input forms:
 *   - success: `{ success: true, value: T, error: null }`
 *   - failure: `{ success: false, value: null, error: E }`
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
export function tryCatch<T, E = Error>(input: Promise<T>): AsyncResult<T, E>
export function tryCatch<T, E = Error>(
    input: () => Promise<T>
): AsyncResult<T, E>
export function tryCatch<T, E = Error>(input: () => T): SyncResult<T, E>
export function tryCatch<T, E = Error>(
    input: Promise<T> | (() => T | Promise<T>)
): SyncResult<T, E> | AsyncResult<T, E> {
    if (typeof input === "function") {
        let produced: T | Promise<T>
        // oxlint-disable-next-line local/no-try-catch
        try {
            produced = input()
        } catch (error) {
            return { success: false, value: null, error: error as E }
        }
        if (produced instanceof Promise) {
            return produced.then(
                (value): SyncResult<T, E> => ({
                    success: true,
                    value,
                    error: null
                }),
                (error: unknown): SyncResult<T, E> => ({
                    success: false,
                    value: null,
                    error: error as E
                })
            )
        }
        return { success: true, value: produced, error: null }
    }
    // Promise.resolve handles both real Promises and non-thenable inputs
    // (e.g. test mocks that return undefined where a Promise was expected).
    return Promise.resolve(input).then(
        (value): SyncResult<T, E> => ({ success: true, value, error: null }),
        (error: unknown): SyncResult<T, E> => ({
            success: false,
            value: null,
            error: error as E
        })
    )
}
