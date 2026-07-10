import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkRestoreElusActionImpl(
    ids: number[],
    context: ActionAPIContext
): Promise<ActionResult<{ count: number }>> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }

    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des éluEs"
        }
    }

    if (ids.length === 0) {
        return { success: false, error: "AucunE éluE à restaurer" }
    }

    const restored = await tryCatch(
        prisma.elu.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null }
        })
    )
    if (!restored.success) {
        captureActionError(restored.error)
        return {
            success: false,
            error: "Erreur lors de la restauration des élus"
        }
    }

    return { success: true, value: { count: restored.value.count } }
}

export const bulkRestoreElusAction = wrapAction(
    "bulkRestoreElusAction",
    bulkRestoreElusActionImpl
)
