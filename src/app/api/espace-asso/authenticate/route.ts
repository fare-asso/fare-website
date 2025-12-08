import type { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { createClient } from "@/helpers/supabase/server"

export async function GET(request: Request) {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)

    const tokenHash = searchParams.get("token_hash")
    const type = searchParams.get("type")
    const redirectTo = searchParams.get("redirect_to")

    if (!tokenHash || !type || !redirectTo) {
        return Response.redirect(new URL("/", request.url))
    }

    const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as EmailOtpType
    })

    if (error) {
        return Response.redirect(new URL("/", request.url))
    }

    redirect(redirectTo)
}
