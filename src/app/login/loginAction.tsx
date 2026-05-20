"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { isDevelopment } from "std-env"

import { env } from "@/env"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function loginWithGoogleActionImpl() {
    const supabase = await createClient()

    // Get the origin from the request headers (works for both dev and preview deployments)
    const url = new URL(env.NEXT_PUBLIC_SITE_URL)
    const origin = isDevelopment
        ? "http://localhost:3000"
        : `${url.protocol}//${url.host}`

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
    const { role, error: roleError } = await getCurrentUserRole()

    if (roleError) {
        return {
            passwordError:
                "Impossible de récupérer les informations de l'utilisateur"
        }
    }

    // Redirect user based on their role
    switch (role) {
        case "ADMIN":
            revalidatePath("/dashboard")
            redirect("/dashboard")
            break
        case "ASSO_OWNER":
            revalidatePath("/espace-asso")
            redirect("/espace-asso")
            break
        case "MEMBER":
            revalidatePath("/dashboard")
            redirect("/dashboard")
            break
    }
}

export const loginWithGoogleAction = withServerAction(
    "loginWithGoogleAction",
    loginWithGoogleActionImpl
)

export const loginWithPasswordAction = withServerAction(
    "loginWithPasswordAction",
    loginWithPasswordActionImpl
)
