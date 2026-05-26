import { NextResponse } from "next/server"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import NewGoogleUserTemplate from "@/../emails/new-google-user"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const NEW_USER_THRESHOLD_MS = 60_000 // 60 seconds

export async function GET(request: Request) {
    const host =
        request.headers.get("x-forwarded-host") ??
        request.headers.get("host")
    const proto =
        request.headers.get("x-forwarded-proto") ??
        (isDevelopment ? "http" : "https")
    const origin = `${proto}://${host}`

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    let next = searchParams.get("next") ?? "/dashboard"
    if (!next.startsWith("/")) {
        next = "/dashboard"
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            console.log("User logged in successfully")

            await upsertUserProfile(supabase)
            await handleNewUserNotification(supabase)

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/login?error=true`)
}

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
