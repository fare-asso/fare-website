import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type DeleteEluResult = { success: true } | { success: false; error: string }

export const deleteEluAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "deleteElu",
            async ({ data: id }): Promise<DeleteEluResult> => {
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

                const elu = await tryCatch(
                    prisma.elu.findUnique({ where: { id } })
                )
                if (!elu.success) {
                    captureActionError(elu.error)
                    return {
                        success: false,
                        error: "Echec de la suppression de l'élu·e"
                    }
                }
                if (elu.value === null) {
                    return { success: false, error: "Élu·e introuvable." }
                }

                const deleted = await tryCatch(
                    prisma.elu.update({
                        where: { id },
                        data: { deletedAt: new Date() }
                    })
                )
                if (!deleted.success) {
                    captureActionError(deleted.error)
                    return {
                        success: false,
                        error: "Echec de la suppression de l'élu·e"
                    }
                }

                return { success: true }
            }
        )
    )
