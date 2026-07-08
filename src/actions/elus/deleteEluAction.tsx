import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeleteEluResult = { success: true } | { success: false; error: string }

async function deleteEluActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<DeleteEluResult> {
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

    const elu = await tryCatch(prisma.elu.findUnique({ where: { id } }))
    if (!elu.success) {
        captureActionError(elu.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }
    if (elu.value === null) {
        return { success: false, error: "Élu·e introuvable." }
    }

    const deleted = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }

    return { success: true }
}

export const deleteEluAction = wrapAction(
    "deleteEluAction",
    deleteEluActionImpl
)
