/**
 * Standard response type for server actions
 * @template T - Optional data type returned on success
 */
export type ActionResponse<T = void> = {
    success?: boolean
    error?: string
    data?: T
    fieldErrors?: Record<string, string[]>
}
