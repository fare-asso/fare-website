import { render } from "@react-email/render"
import { NextResponse } from "next/server"
import { isDevelopment } from "std-env"
import NewGoogleUserTemplate from "@/../emails/new-google-user"
import { sendEmail } from "@/helpers/email"
import { createClient } from "@/helpers/supabase/server"

const NEW_USER_THRESHOLD_MS = 60_000 // 60 seconds

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
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

            // Check if this is a new user and send notification
            await handleNewUserNotification(supabase)

            const forwardedHost = request.headers.get("x-forwarded-host") // original origin before load balancer
            if (isDevelopment) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=true`)
}

async function handleNewUserNotification(
    supabase: Awaited<ReturnType<typeof createClient>>
) {
    try {
        const {
            data: { user }
        } = await supabase.auth.getUser()

        if (!user?.id || !user.email || !user.created_at) return

        // Check if user was created within the last 60 seconds (new user)
        const createdAt = new Date(user.created_at)
        const isNewUser =
            Date.now() - createdAt.getTime() < NEW_USER_THRESHOLD_MS

        if (isNewUser) {
            const loginDate = new Date().toLocaleString("fr-FR", {
                timeZone: "Europe/Paris"
            })
            const name = user.user_metadata?.full_name || "Non renseigné"

            // Send notification email
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
    } catch (error) {
        // Don't fail the login if notification fails
        console.error("Error handling new user notification:", error)
    }
}
