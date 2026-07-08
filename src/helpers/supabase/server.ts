import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import { env } from "@/env"
import { tryCatch } from "@/lib/utils"

export { createAdminClient } from "./astro"

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        env.PUBLIC_SUPABASE_URL,
        env.PUBLIC_SUPABASE_ANON_KEY,
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
