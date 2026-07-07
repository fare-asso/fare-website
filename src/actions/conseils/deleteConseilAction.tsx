import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type DeleteConseilResult = { success: true } | { success: false; error: string }

export const deleteConseilAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "deleteConseilAction",
            async ({ data: id }): Promise<DeleteConseilResult> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return {
                        success: false,
                        error: "Authentification requise"
                    }
                }
                if (!hasPermission(user, "delete:instance")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des conseils"
                    }
                }

                const conseil = await tryCatch(
                    prisma.conseil.findUnique({ where: { id } })
                )
                if (!conseil.success) {
                    captureActionError(conseil.error)
                    return {
                        success: false,
                        error: "Echec de la suppression du conseil"
                    }
                }
                if (conseil.value === null) {
                    return {
                        success: false,
                        error: "Conseil introuvable."
                    }
                }

                const eluCount = await tryCatch(
                    prisma.elu.count({
                        where: { conseilId: id, deletedAt: null }
                    })
                )
                if (!eluCount.success) {
                    captureActionError(eluCount.error)
                    return {
                        success: false,
                        error: "Echec de la suppression du conseil"
                    }
                }
                if (eluCount.value > 0) {
                    return {
                        success: false,
                        error: "Supprimez d'abord les éluEs de ce conseil avant de le supprimer."
                    }
                }

                const deleted = await tryCatch(
                    prisma.conseil.delete({ where: { id } })
                )
                if (!deleted.success) {
                    captureActionError(deleted.error)
                    return {
                        success: false,
                        error: "Echec de la suppression du conseil"
                    }
                }

                return { success: true }
            }
        )
    )
