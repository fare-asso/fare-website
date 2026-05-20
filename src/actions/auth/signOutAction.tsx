"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function signOutImpl(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

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
    redirect("/login")
}

export const signOut = withServerAction("signOut", signOutImpl)
