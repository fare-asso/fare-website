import type { ActionAPIContext } from "astro:actions"

import type { Role } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkUpdateRoleImpl(
    input: { userIds: string[]; newRole: Role },
    context: ActionAPIContext
) {
    const { userIds, newRole } = input
    const currentUser = await getUserWithPermissions(context)
    if (!currentUser) {
        return { success: false, error: "Non authentifié" }
    }

    if (!hasRole(currentUser, "ADMIN")) {
        return { success: false, error: "Accès réservé aux administrateurs" }
    }

    if (!hasPermission(currentUser, "edit:user")) {
        return { success: false, error: "Permission insuffisante" }
    }

    // Filter out current user to prevent self-demotion
    const filteredIds = userIds.filter((id) => id !== currentUser.id)

    if (filteredIds.length === 0) {
        return {
            success: false,
            error: "Aucun utilisateur à modifier (vous ne pouvez pas changer votre propre rôle en masse)"
        }
    }

    const result = await tryCatch(
        prisma.user.updateMany({
            where: { id: { in: filteredIds } },
            data: { role: newRole }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la modification des rôles"
        }
    }

    return {
        success: true,
        updatedCount: filteredIds.length,
        skippedSelf: userIds.length !== filteredIds.length
    }
}

export const bulkUpdateRole = wrapAction("bulkUpdateRole", bulkUpdateRoleImpl)
