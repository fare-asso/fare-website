import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const archiveTutorApplicationAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction(
            "archiveTutorApplication",
            async ({ data: { id } }) => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "access:btp")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission d'effectuer cette opération"
                    }
                }

                const result = await tryCatch(
                    prisma.bTPTutorApplication.update({
                        where: { id },
                        data: { archived: new Date() }
                    })
                )
                if (!result.success) {
                    captureActionError(result.error)
                    return {
                        success: false,
                        error: "Echec de l'archivage de la candidature"
                    }
                }

                return { success: true }
            }
        )
    )
