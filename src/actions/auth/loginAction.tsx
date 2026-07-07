import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"
import { isDevelopment } from "std-env"

import { env } from "@/env.server"
import { clientEnv } from "@/env/client"
import { createClient } from "@/helpers/supabase.server"
import getCurrentUserRole from "@/helpers/user/role.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const loginWithGoogleAction = createServerFn({ method: "POST" }).handler(
    withServerAction("loginWithGoogleAction", async () => {
        const supabase = createClient()

        // Only trust x-forwarded-host (set by the ingress); never the raw
        // Host header, which is client-controllable. Fall back to the
        // canonical URL. In dev, use the actual Host so the callback
        // returns to the same dev server regardless of which port vite
        // picked.
        const fallback = new URL(
            env.DOKPLOY_DEPLOY_URL || clientEnv.VITE_SITE_URL
        )
        const host =
            getRequestHeader("x-forwarded-host") ??
            (isDevelopment ? getRequestHeader("host") : undefined) ??
            fallback.host
        const proto =
            getRequestHeader("x-forwarded-proto") ??
            (isDevelopment ? "http" : fallback.protocol.replace(":", ""))
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
            throw redirect({ href: data.url })
        }

        throw new Error("Unexpected error")
    })
)

export const loginWithPasswordAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction("loginWithPasswordAction", async ({ data }) => {
            if (!isDevelopment) return

            const supabase = createClient()

            const email = data.get("email")?.toString()
            const password = data.get("password")?.toString()

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
                    err && typeof err === "object" && "code" in err
                        ? err.code
                        : null
                if (code === "invalid_credentials") {
                    return {
                        passwordError:
                            "Mot de passe ou nom d'utilisateur invalide"
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

            throw redirect({ href: "/dashboard" })
        })
    )
