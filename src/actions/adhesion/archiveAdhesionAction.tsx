import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const archiveAdhesionAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "archiveAdhesionAction",
            async ({
                data: adhesionId
            }): Promise<{ success?: boolean; error?: string }> => {
                // Auth and permission verifications
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:adhesion")) {
                    return {
                        error: "Vous n'avez pas la permission d'effectuer cette opération"
                    }
                }

                const result = await tryCatch(
                    prisma.adhesion.update({
                        where: {
                            id: adhesionId
                        },
                        data: {
                            archived: new Date()
                        }
                    })
                )
                if (!result.success) {
                    captureActionError(result.error)
                    return {
                        error: "Echec de l'archivage de la demande d'adhésion"
                    }
                }

                return { success: true }
            }
        )
    )
