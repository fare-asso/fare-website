import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function restoreUser(userId: string, context?: ActionAPIContext) {
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

    // Restore: clear deletedAt timestamp
    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
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

    return { success: true }
}
