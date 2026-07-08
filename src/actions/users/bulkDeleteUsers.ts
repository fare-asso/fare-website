import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkDeleteUsersImpl(
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

    // Filter out current user from deletion list
    const filteredIds = userIds.filter((id) => id !== currentUser.id)

    if (filteredIds.length === 0) {
        return {
            success: false,
            error: "Aucun utilisateur à supprimer (vous ne pouvez pas vous supprimer vous-même)"
        }
    }

    // Soft delete: set deletedAt timestamp for all selected users
    const result = await tryCatch(
        prisma.user.updateMany({
            where: { id: { in: filteredIds } },
            data: { deletedAt: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        }
    }

    return {
        success: true,
        deletedCount: filteredIds.length,
        skippedSelf: userIds.length !== filteredIds.length
    }
}

export const bulkDeleteUsers = wrapAction(
    "bulkDeleteUsers",
    bulkDeleteUsersImpl
)
