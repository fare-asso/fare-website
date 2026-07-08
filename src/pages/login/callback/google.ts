import * as Sentry from "@sentry/astro"
import type { APIRoute } from "astro"
import { render } from "react-email"

import NewGoogleUserTemplate from "@/../emails/new-google-user"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { requestOrigin } from "@/helpers/requestOrigin"
import { createClient } from "@/helpers/supabase/astro"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const NEW_USER_THRESHOLD_MS = 60_000 // 60 seconds

type SupabaseClient = ReturnType<typeof createClient>

export const GET: APIRoute = async (context) => {
    const origin = requestOrigin(context.request)

    const code = context.url.searchParams.get("code")
    let next = context.url.searchParams.get("next") ?? "/dashboard"
    // Reject absolute URLs and protocol-relative URLs (//attacker.com/...)
    if (!next.startsWith("/") || next.startsWith("//")) {
        next = "/dashboard"
    }

    if (code) {
        const supabase = createClient(context)
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error(error)
            Sentry.captureException(error)
        } else {
            await upsertUserProfile(supabase)
            await handleNewUserNotification(supabase)

            return context.redirect(`${origin}${next}`)
        }
    }

    return context.redirect(`${origin}/login?error=true`)
}

async function upsertUserProfile(supabase: SupabaseClient): Promise<void> {
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
    supabase: SupabaseClient
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
                NewGoogleUserTemplate({
                    email: user.email,
                    name,
                    loginDate
                })
            )
        })
    }
}
