import type { APIRoute } from "astro"

import { requestOrigin } from "@/helpers/requestOrigin"
import { createClient } from "@/helpers/supabase/astro"

export const GET: APIRoute = async (context) => {
    const supabase = createClient(context)
    const origin = requestOrigin(context.request)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/login/callback/google`
        }
    })

    if (error || !data.url) {
        console.error(error?.message ?? "Missing OAuth URL")
        return context.redirect("/login?error=true")
    }

    return context.redirect(data.url)
}
