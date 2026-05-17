"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function signOutImpl(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
        const { error } = await supabase.auth.signOut()

        if (error) {
            console.error(error.message)
            return { success: false, error: error.message }
        }
    } catch (error) {
        captureActionError(error)
        return { success: false, error: "Echec de la déconnexion" }
    }

    console.log("Deconnection réussie")
    redirect("/login")
}

export const signOut = withServerAction("signOut", signOutImpl)
