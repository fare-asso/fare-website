"use server"

import type { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function bulkUpdateRoleImpl(userIds: string[], newRole: Role) {
    const currentUser = await getCurrentUserWithPermissions()
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

    try {
        await prisma.user.updateMany({
            where: { id: { in: filteredIds } },
            data: { role: newRole }
        })

        revalidatePath("/dashboard/users")
        return {
            success: true,
            updatedCount: filteredIds.length,
            skippedSelf: userIds.length !== filteredIds.length
        }
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la modification des rôles"
        }
    }
}

export default withServerAction("bulkUpdateRole", bulkUpdateRoleImpl)
