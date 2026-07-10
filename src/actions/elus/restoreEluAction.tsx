import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function restoreEluActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des élu·e·s"
        }
    }

    const restored = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: null }
        })
    )
    if (!restored.success) {
        captureActionError(restored.error)
        return {
            success: false,
            error: "Echec de la restauration de l'élu·e"
        }
    }

    return { success: true }
}

export const restoreEluAction = wrapAction(
    "restoreEluAction",
    restoreEluActionImpl
)
