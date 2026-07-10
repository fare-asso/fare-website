import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteConseilActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des conseils"
        }
    }

    const conseil = await tryCatch(prisma.conseil.findUnique({ where: { id } }))
    if (!conseil.success) {
        captureActionError(conseil.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }
    if (conseil.value === null) {
        return { success: false, error: "Conseil introuvable." }
    }

    const eluCount = await tryCatch(
        prisma.elu.count({ where: { conseilId: id, deletedAt: null } })
    )
    if (!eluCount.success) {
        captureActionError(eluCount.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }
    if (eluCount.value > 0) {
        return {
            success: false,
            error: "Supprimez d'abord les éluEs de ce conseil avant de le supprimer."
        }
    }

    const deleted = await tryCatch(prisma.conseil.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }

    return { success: true }
}

export const deleteConseilAction = wrapAction(
    "deleteConseilAction",
    deleteConseilActionImpl
)
