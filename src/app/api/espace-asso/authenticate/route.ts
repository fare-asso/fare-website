import { createClient } from "@/helpers/supabase/server"
import { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)

    const token_hash = searchParams.get("token_hash")
    const type = searchParams.get("type")
    const redirectTo = searchParams.get("redirect_to")

    if (!token_hash || !type || !redirectTo) {
        return Response.redirect(new URL("/", request.url))
    }

    const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token_hash,
        type: type as EmailOtpType
    })

    if (error) {
        return Response.redirect(new URL("/", request.url))
    }

    redirect(redirectTo)
}
