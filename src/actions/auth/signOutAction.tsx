import type { ActionAPIContext } from "astro:actions"

import { createClient } from "@/helpers/supabase/astro"
import type { ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function signOut(
    _input: undefined,
    context?: ActionAPIContext
): Promise<ActionResult> {
    const supabase = createClient(context)

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
    return { success: true }
}
