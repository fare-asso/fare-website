import type { APIRoute } from "astro"
import { isDevelopment } from "std-env"

import { createClient } from "@/helpers/supabase/astro"
import { tryCatch } from "@/lib/utils"

// Dev-only email/password login.
export const POST: APIRoute = async (context) => {
    if (!isDevelopment) {
        return context.redirect("/login")
    }

    const formData = await context.request.formData()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
        return context.redirect("/login?error=missing_credentials")
    }

    const supabase = createClient(context)
    const signIn = await tryCatch(
        supabase.auth.signInWithPassword({ email, password })
    )
    if (!signIn.success) {
        return context.redirect("/login?error=invalid_credentials")
    }

    return context.redirect("/dashboard")
}
