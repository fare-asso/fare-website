import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteMemberActionImpl(
    { id }: { id: number },
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:member")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des membres"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    const deleted = await tryCatch(
        prisma.member.delete({
            where: { id: id }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { success: false, error: "Echec de la suppression du membre" }
    }
    const res = deleted.value

    if (res == null) return { success: false, error: "Failed to delete record" }

    // successfully deleted
    const { error } = await supabase.storage
        .from("member-pictures")
        .remove([res.picturePath])

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

export const deleteMemberAction = wrapAction(
    "deleteMemberAction",
    deleteMemberActionImpl
)
