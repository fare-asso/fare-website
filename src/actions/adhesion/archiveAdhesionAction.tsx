import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function archiveAdhesionActionImpl(
    adhesionId: number,
    context: ActionAPIContext
): Promise<{ success: true } | { success: false; error: string }> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:adhesion")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.adhesion.update({
            where: {
                id: adhesionId
            },
            data: {
                archived: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec de l'archivage de la demande d'adhésion"
        }
    }

    return { success: true }
}

export const archiveAdhesionAction = wrapAction(
    "archiveAdhesionAction",
    archiveAdhesionActionImpl
)
