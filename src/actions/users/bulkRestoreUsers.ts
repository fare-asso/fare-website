import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const bulkRestoreUsersAction = createServerFn({ method: "POST" })
    .validator((data: { userIds: string[] }) => data)
    .handler(
        withServerAction("bulkRestoreUsers", async ({ data: { userIds } }) => {
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

            if (!hasPermission(currentUser, "delete:user")) {
                return { success: false, error: "Permission insuffisante" }
            }

            if (userIds.length === 0) {
                return {
                    success: false,
                    error: "Aucun utilisateur sélectionné"
                }
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
        })
    )
