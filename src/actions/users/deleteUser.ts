import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteUserImpl(userId: string, context: ActionAPIContext) {
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

    // Prevent self-deletion
    if (currentUser.id === userId) {
        return {
            success: false,
            error: "Vous ne pouvez pas supprimer votre propre compte"
        }
    }

    // Soft delete: set deletedAt timestamp
    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
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

    return { success: true }
}

export const deleteUser = wrapAction("deleteUser", deleteUserImpl)
