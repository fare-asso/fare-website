import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
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
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    tryCatch(() => {
                        for (const { name, value, options } of cookiesToSet) {
                            cookieStore.set(name, value, options)
                        }
                    })
                }
            }
        }
    )
}

export function createAdminClient() {
    // Bypass @supabase/ssr: it reads the user session from cookies and sends
    // the user's JWT as Authorization, overriding the service-role key on
    // PostgREST requests. The plain client sends the service-role key as
    // both apikey and Authorization, so queries actually run as service_role.
    return createSupabaseClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    )
}
