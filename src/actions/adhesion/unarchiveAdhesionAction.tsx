import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function unarchiveAdhesionActionImpl(
    adhesionId: number,
    context: ActionAPIContext
): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:adhesion")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.adhesion.update({
            where: {
                id: adhesionId
            },
            data: {
                archived: null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la désarchivation de la demande d'adhésion" }
    }

    return { success: true }
}

export const unarchiveAdhesionAction = wrapAction(
    "unarchiveAdhesionAction",
    unarchiveAdhesionActionImpl
)
