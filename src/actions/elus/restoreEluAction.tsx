import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type RestoreEluResult = { success: true } | { success: false; error: string }

export const restoreEluAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "restoreElu",
            async ({ data: id }): Promise<RestoreEluResult> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "delete:elu")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des élu·e·s"
                    }
                }

                const restored = await tryCatch(
                    prisma.elu.update({
                        where: { id },
                        data: { deletedAt: null }
                    })
                )
                if (!restored.success) {
                    captureActionError(restored.error)
                    return {
                        success: false,
                        error: "Echec de la restauration de l'élu·e"
                    }
                }

                return { success: true }
            }
        )
    )
