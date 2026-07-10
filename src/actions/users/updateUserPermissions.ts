import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function updateUserPermissionsImpl(
    input: { userId: string; permissions: number[] },
    context: ActionAPIContext
) {
    const { userId, permissions } = input
    const user = await getUserWithPermissions(context)
    if (!user) {
        throw new Error("Unauthorized: User not found")
    }

    if (!hasRole(user, "ADMIN")) {
        throw new Error("Forbidden: Admin only")
    }

    if (!hasPermission(user, "edit:user-permissions")) {
        throw new Error("Forbidden: Insufficient permissions")
    }

    // Commencer une transaction pour supprimer les anciennes permissions et ajouter les nouvelles
    const result = await tryCatch(
        prisma.$transaction(async (tx) => {
            // Supprimer les permissions existantes pour cet utilisateur
            await tx.userPermission.deleteMany({
                where: {
                    userId
                }
            })

            // Ajouter les nouvelles permissions
            const newPermissions = permissions.map((permissionId) => ({
                userId,
                permissionId
            }))

            await tx.userPermission.createMany({
                data: newPermissions,
                skipDuplicates: true
            })
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "An error occurred while updating permissions."
        }
    }

    return { success: true }
}

export const updateUserPermissions = wrapAction(
    "updateUserPermissions",
    updateUserPermissionsImpl
)
