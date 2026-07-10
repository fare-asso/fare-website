import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkRestoreUsersImpl(
    userIds: string[],
    context: ActionAPIContext
) {
    const currentUser = await getUserWithPermissions(context)
    if (!currentUser) {
        return { success: false, error: "Non authentifié" }
    }

    if (!hasRole(currentUser, "ADMIN")) {
        return { success: false, error: "Accès réservé aux administrateurs" }
    }

    if (!hasPermission(currentUser, "delete:user")) {
        return { success: false, error: "Permission insuffisante" }
    }

    if (userIds.length === 0) {
        return { success: false, error: "Aucun utilisateur sélectionné" }
    }

    // Restore: clear deletedAt timestamp for all selected users
    const result = await tryCatch(
        prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { deletedAt: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la restauration"
        }
    }

    return { success: true, restoredCount: userIds.length }
}

export const bulkRestoreUsers = wrapAction(
    "bulkRestoreUsers",
    bulkRestoreUsersImpl
)
