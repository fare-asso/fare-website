import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const restoreUserAction = createServerFn({ method: "POST" })
    .validator((data: { userId: string }) => data)
    .handler(
        withServerAction("restoreUser", async ({ data: { userId } }) => {
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
        })
    )
