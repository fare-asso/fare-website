import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { createClient } from "@/helpers/supabase.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const signOut = createServerFn({ method: "POST" }).handler(
    withServerAction(
        "signOut",
        async (): Promise<{ success: boolean; error?: string }> => {
            const supabase = createClient()

            const result = await tryCatch(supabase.auth.signOut())
            if (!result.success) {
                captureActionError(result.error)
                return { success: false, error: "Echec de la déconnexion" }
            }
            const { error } = result.value
            if (error) {
                console.error(error.message)
                return { success: false, error: error.message }
            }

            console.log("Deconnection réussie")
            throw redirect({ href: "/login" })
        }
    )
)
