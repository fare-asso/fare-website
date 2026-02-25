"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/helpers/supabase/server"

export async function signOut(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error.message)
        return { success: false, error: error.message }
    }

    console.log("Deconnection réussie")
    redirect("/login")
}
