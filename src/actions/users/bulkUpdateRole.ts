import { createServerFn } from "@tanstack/react-start"

import type { Role } from "@/generated/prisma/client"
import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const bulkUpdateRoleAction = createServerFn({ method: "POST" })
    .validator((data: { userIds: string[]; newRole: Role }) => data)
    .handler(
        withServerAction(
            "bulkUpdateRole",
            async ({ data: { userIds, newRole } }) => {
                const currentUser = await getCurrentUserWithPermissions()
                if (!currentUser) {
                    return { success: false, error: "Non authentifié" }
                }

                if (!hasRole(currentUser, "ADMIN")) {
                    return {
                        success: false,
                        error: "Accès réservé aux administrateurs"
                    }
                }

                if (!hasPermission(currentUser, "edit:user")) {
                    return { success: false, error: "Permission insuffisante" }
                }

                // Filter out current user to prevent self-demotion
                const filteredIds = userIds.filter(
                    (id) => id !== currentUser.id
                )

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
        )
    )
