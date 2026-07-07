import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

export const bulkRestoreElusAction = createServerFn({ method: "POST" })
    .validator((data: number[]) => data)
    .handler(
        withServerAction(
            "bulkRestoreElus",
            async ({ data: ids }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }

                if (!hasPermission(user, "delete:elu")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des éluEs"
                    }
                }

                if (ids.length === 0) {
                    return { success: false, error: "AucunE éluE à restaurer" }
                }

                const restored = await tryCatch(
                    prisma.elu.updateMany({
                        where: { id: { in: ids } },
                        data: { deletedAt: null }
                    })
                )
                if (!restored.success) {
                    captureActionError(restored.error)
                    return {
                        success: false,
                        error: "Erreur lors de la restauration des élus"
                    }
                }

                return { success: true, value: { count: restored.value.count } }
            }
        )
    )
