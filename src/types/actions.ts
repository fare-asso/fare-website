/**
 * Standard response type for server actions
 * @template T - Optional data type returned on success
 */
export type ActionResponse<T = void> =
    | {
          success: true
          error?: null
          data?: T
          fieldErrors?: null
      }
    | {
          success?: false
          error?: string
          data?: null
          fieldErrors?: Record<string, string[]>
      }
