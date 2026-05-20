import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { env } from "@/env"
import { tryCatch } from "@/lib/utils"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // The `set` method may be called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    tryCatch(() => cookieStore.set({ name, value, ...options }))
                },
                remove(name: string, options: CookieOptions) {
                    // The `delete` method may be called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    tryCatch(() =>
                        cookieStore.set({ name, value: "", ...options })
                    )
                }
            }
        }
    )
}

export async function createAdminClient() {
    const cookieStore = await cookies()

    return createServerClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    // The `set` method may be called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    tryCatch(() => cookieStore.set({ name, value, ...options }))
                },
                remove(name: string, options: CookieOptions) {
                    // The `delete` method may be called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    tryCatch(() =>
                        cookieStore.set({ name, value: "", ...options })
                    )
                }
            }
        }
    )
}
