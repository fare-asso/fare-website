import * as Sentry from "@sentry/tanstackstart-react"
import { createFileRoute } from "@tanstack/react-router"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import NewGoogleUserTemplate from "@/../emails/new-google-user"
import { env } from "@/env.server"
import { clientEnv } from "@/env/client"
import prisma from "@/helpers/db.server"
import { sendEmail } from "@/helpers/email.server"
import { createClient } from "@/helpers/supabase.server"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const NEW_USER_THRESHOLD_MS = 60_000 // 60 seconds

export const Route = createFileRoute("/login/callback/google")({
    server: {
        handlers: {
            GET: async ({ request }) => {
                // Only trust x-forwarded-host (set by the ingress); never the
                // raw Host header, which is client-controllable. Fall back to
                // the canonical URL. In dev, use the actual Host so redirects
                // stay on the same dev server/port.
                const fallback = new URL(
                    env.DOKPLOY_DEPLOY_URL || clientEnv.VITE_SITE_URL
                )
                const host =
                    request.headers.get("x-forwarded-host") ??
                    (isDevelopment ? request.headers.get("host") : undefined) ??
                    fallback.host
                const proto =
                    request.headers.get("x-forwarded-proto") ??
                    (isDevelopment
                        ? "http"
                        : fallback.protocol.replace(":", ""))
                const origin = `${proto}://${host}`

                const { searchParams } = new URL(request.url)
                const code = searchParams.get("code")
                let next = searchParams.get("next") ?? "/dashboard"
                // Reject absolute URLs and protocol-relative URLs
                // (//attacker.com/...)
                if (!next.startsWith("/") || next.startsWith("//")) {
                    next = "/dashboard"
                }

                if (code) {
                    const supabase = createClient()
                    const { error } =
                        await supabase.auth.exchangeCodeForSession(code)
                    if (error) {
                        console.error(error)
                        Sentry.captureException(error, { extra: { request } })
                    } else {
                        console.log("User logged in successfully")

                        await upsertUserProfile(supabase)
                        await handleNewUserNotification(supabase)

                        return new Response(null, {
                            status: 302,
                            headers: { Location: `${origin}${next}` }
                        })
                    }
                }

                return new Response(null, {
                    status: 302,
                    headers: { Location: `${origin}/login?error=true` }
                })
            }
        }
    }
})

async function upsertUserProfile(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
    const userResult = await tryCatch(supabase.auth.getUser())
    if (!userResult.success) {
        captureActionError(userResult.error)
        return
    }
    const { user } = userResult.value

    if (!user?.id || !user.email) return

    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const pictureUrl = user.user_metadata?.picture as string | undefined
    const profilePicture = avatarUrl || pictureUrl
    const fullName = user.user_metadata?.full_name as string | undefined

    const upsertResult = await tryCatch(
        prisma.user.upsert({
            where: { id: user.id },
            create: {
                id: user.id,
                email: user.email,
                name: fullName,
                image: profilePicture
            },
            update: {
                ...(fullName ? { name: fullName } : {}),
                ...(profilePicture ? { image: profilePicture } : {})
            }
        })
    )
    if (!upsertResult.success) {
        captureActionError(upsertResult.error)
    }
}

async function handleNewUserNotification(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
    const userResult = await tryCatch(supabase.auth.getUser())
    if (!userResult.success) {
        captureActionError(userResult.error)
        return
    }
    const { user } = userResult.value

    if (!user?.id || !user.email || !user.created_at) return

    // Check if user was created within the last 60 seconds (new user)
    const createdAt = new Date(user.created_at)
    const isNewUser = Date.now() - createdAt.getTime() < NEW_USER_THRESHOLD_MS

    if (isNewUser) {
        const loginDate = new Date().toLocaleString("fr-FR", {
            timeZone: "Europe/Paris"
        })
        const name = user.user_metadata?.full_name || "Non renseigné"

        // sendEmail reports its own failures to Sentry.
        await sendEmail({
            to: "outils-numeriques@fare-asso.fr",
            subject: "Nouvelle connexion Google sur le site FARE",
            html: await render(
                <NewGoogleUserTemplate
                    email={user.email}
                    name={name}
                    loginDate={loginDate}
                />
            )
        })

        console.log(`New user notification sent for: ${user.email}`)
    }
}
