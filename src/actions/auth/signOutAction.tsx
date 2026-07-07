import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function signOutImpl(): Promise<{ success: boolean; error?: string }> {
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

const signOutServerFn = createServerFn({ method: "POST" })
    .validator((data: ActionPayload<Parameters<typeof signOutImpl>>) => data)
    .handler(({ data }) =>
        withServerAction(
            "signOut",
            signOutImpl
        )(...unpackActionArgs<Parameters<typeof signOutImpl>>(data))
    )

export const signOut = async (
    ...args: Parameters<typeof signOutImpl>
): ReturnType<typeof signOutImpl> =>
    signOutServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof signOutImpl
    >
