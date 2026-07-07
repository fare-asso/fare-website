import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

export const deleteLinkCategoryAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "deleteLinkCategoryAction",
            async ({ data: id }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "delete:lien")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des catégories"
                    }
                }

                const deleted = await tryCatch(
                    prisma.linkCategory.delete({ where: { id } })
                )
                if (!deleted.success) {
                    captureActionError(deleted.error)
                    return {
                        success: false,
                        error: "Echec de la suppression de la catégorie"
                    }
                }

                return { success: true }
            }
        )
    )
