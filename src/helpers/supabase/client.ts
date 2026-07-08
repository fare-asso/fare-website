import { createBrowserClient } from "@supabase/ssr"

import { env } from "@/env"

export function createClient() {
    return createBrowserClient(
        env.PUBLIC_SUPABASE_URL,
        env.PUBLIC_SUPABASE_ANON_KEY
    )
}
