import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const unarchiveAdhesionAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "unarchiveAdhesionAction",
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
                            archived: null
                        }
                    })
                )
                if (!result.success) {
                    captureActionError(result.error)
                    return {
                        error: "Echec de la désarchivation de la demande d'adhésion"
                    }
                }

                return { success: true }
            }
        )
    )
