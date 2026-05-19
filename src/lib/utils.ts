import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Wraps a promise in a try/catch block and returns a Result object representing
 * either a successful value or an error.
 *
 * This utility function provides a more structured way to handle asynchronous operations
 * without using try/catch blocks throughout your codebase. It follows a pattern similar
 * to Rust's Result type, allowing for more predictable error handling.
 *
 * @template T - The type of the value returned by the promise on success
 * @template E - The type of the error object (defaults to Error)
 *
 * @param promise - The promise to wrap and execute
 *
 * @returns A Promise resolving to a discriminated union object with:
 *   - On success: `{ success: true, value: T, error: null }`
 *   - On failure: `{ success: false, value: null, error: E }`
 *
 * @example
 * // Success case
 * const successResult = await tryCatch(Promise.resolve('data'));
 * if (successResult.success) {
 *   console.log(successResult.value); // 'data'
 * }
 *
 * @example
 * // Error case
 * const errorResult = await tryCatch(Promise.reject(new Error('Failed')));
 * if (!errorResult.success) {
 *   console.error(errorResult.error.message); // 'Failed'
 * }
 *
 * @example
 * // Using with custom error type
 * interface ApiError { code: number; message: string }
 * const apiCall = tryCatch<UserData, ApiError>(fetchUserData());
 */
export async function tryCatch<T, E = Error>(
    promise: Promise<T>
): Promise<
    | {
          success: true
          value: T
          error: null
      }
    | {
          success: false
          value: null
          error: E
      }
> {
    // oxlint-disable-next-line local/no-try-catch
    try {
        const value = await promise
        return { success: true, value, error: null }
    } catch (error) {
        return { success: false, value: null, error: error as E }
    }
}
