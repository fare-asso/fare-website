"use server"

import { redirect } from "next/navigation"

import { createClient } from "@/helpers/supabase/server"

export default async function SignOutAction() {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error(error.message)
    } else {
        console.log("Deconnection réussie")
        redirect("/login")
    }
}
