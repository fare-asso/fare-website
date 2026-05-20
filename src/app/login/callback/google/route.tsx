import { NextResponse } from "next/server"
import { render } from "react-email"
import { isDevelopment } from "std-env"

import NewGoogleUserTemplate from "@/../emails/new-google-user"
import { env } from "@/env"
import prisma from "@/helpers/db"
import { sendEmail } from "@/helpers/email"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const NEW_USER_THRESHOLD_MS = 60_000 // 60 seconds

export async function GET(request: Request) {
    const host = new URL(env.NEXT_PUBLIC_SITE_URL).host
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get("next") ?? "/dashboard"
    if (!next.startsWith("/")) {
        // if "next" is not a relative URL, use the default
        next = "/dashboard"
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            console.log("User logged in successfully")

            // Update user profile picture from Google if available
            await updateUserProfilePicture(supabase)

            // Check if this is a new user and send notification
            await handleNewUserNotification(supabase)

            const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
            if (isDevelopment) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${host}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${host}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${host}/login?error=true`)
}

async function updateUserProfilePicture(
    supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
    const userResult = await tryCatch(supabase.auth.getUser())
    if (!userResult.success) {
        captureActionError(userResult.error)
        return
    }
    const { user } = userResult.value

    if (!user?.id) return

    // Get profile data from Google OAuth metadata
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined
    const pictureUrl = user.user_metadata?.picture as string | undefined
    const profilePicture = avatarUrl || pictureUrl
    const fullName = user.user_metadata?.full_name as string | undefined

    // Check current user data in database
    const dbUserResult = await tryCatch(
        prisma.user.findUnique({
            where: { id: user.id },
            select: { image: true, name: true }
        })
    )
    if (!dbUserResult.success) {
        captureActionError(dbUserResult.error)
        return
    }
    const dbUser = dbUserResult.value

    if (!dbUser) return

    // Prepare update data
    const updateData: { image?: string; name?: string } = {}

    // Only update if the image has changed or is not set
    if (profilePicture && dbUser.image !== profilePicture) {
        updateData.image = profilePicture
    }

    // Only update name if it has changed or is not set
    if (fullName && dbUser.name !== fullName) {
        updateData.name = fullName
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
        const updateResult = await tryCatch(
            prisma.user.update({
                where: { id: user.id },
                data: updateData
            })
        )
        if (!updateResult.success) {
            captureActionError(updateResult.error)
            return
        }
        console.log(
            `Updated user profile for ${user.id}:`,
            Object.keys(updateData)
        )
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
