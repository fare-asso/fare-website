import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { getCookies, setCookie } from "@tanstack/react-start/server"

import { env } from "@/env.server"
import { clientEnv } from "@/env/client"
import { tryCatch } from "@/lib/utils"

export function createClient() {
    return createServerClient(
        clientEnv.VITE_SUPABASE_URL,
        clientEnv.VITE_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return Object.entries(getCookies()).map(
                        ([name, value]) => ({ name, value })
                    )
                },
                setAll(cookiesToSet) {
                    tryCatch(() => {
                        for (const { name, value, options } of cookiesToSet) {
                            setCookie(name, value, options)
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
        clientEnv.VITE_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        }
    )
}
