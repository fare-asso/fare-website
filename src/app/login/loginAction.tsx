"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isDevelopment } from "std-env"

import { env } from "@/env"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function loginWithGoogleActionImpl() {
    const supabase = await createClient()

    // Only trust x-forwarded-host (set by the ingress); never the raw Host
    // header, which is client-controllable. Fall back to the canonical URL.
    const fallback = new URL(env.DOKPLOY_DEPLOY_URL || env.PUBLIC_SITE_URL)
    const h = await headers()
    const host = h.get("x-forwarded-host") ?? fallback.host
    const proto =
        h.get("x-forwarded-proto") ?? fallback.protocol.replace(":", "")
    const origin = `${proto}://${host}`

    console.log(
        "loginWithGoogleAction - redirectTo:",
        `${origin}/login/callback/google`
    )

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/login/callback/google`
        }
    })

    if (error) {
        console.error(error.message)
        throw new Error("Failed to login with Google")
    }

    if (data.url) {
        redirect(data.url)
    }

    throw new Error("Unexpected error")
}

async function loginWithPasswordActionImpl(
    _currentState: { emailError?: string; passwordError?: string } | undefined,
    formData: FormData
) {
    if (!isDevelopment) return

    const supabase = await createClient()

    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    // Fields validation
    if (!email) {
        return {
            emailError: "Veuillez entrer une adresse email"
        }
    }

    if (!password) {
        return {
            passwordError: "Veuillez entrer un mot de passe"
        }
    }

    const signIn = await tryCatch(
        supabase.auth.signInWithPassword({
            email,
            password
        })
    )
    if (!signIn.success) {
        const err = signIn.error
        const code =
            err && typeof err === "object" && "code" in err ? err.code : null
        if (code === "invalid_credentials") {
            return {
                passwordError: "Mot de passe ou nom d'utilisateur invalide"
            }
        }
        captureActionError(err)
        return {
            passwordError: "Une erreur inattendue est survenue"
        }
    }

    // fetch user role
    const { error: roleError } = await getCurrentUserRole()

    if (roleError) {
        return {
            passwordError:
                "Impossible de récupérer les informations de l'utilisateur"
        }
    }

    redirect("/dashboard")
}

export const loginWithGoogleAction = withServerAction(
    "loginWithGoogleAction",
    loginWithGoogleActionImpl
)

export const loginWithPasswordAction = withServerAction(
    "loginWithPasswordAction",
    loginWithPasswordActionImpl
)
