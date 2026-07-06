import { createBrowserClient } from "@supabase/ssr"

import { clientEnv } from "@/env/client"

export function createClient() {
    return createBrowserClient(
        clientEnv.VITE_SUPABASE_URL,
        clientEnv.VITE_SUPABASE_ANON_KEY
    )
}
