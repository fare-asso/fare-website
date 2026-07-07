import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditLinkCategorySchema, type TEditLinkCategory } from "@/schemas/link"

type Result = { success: true } | { success: false; error: string }

export const editLinkCategoryAction = createServerFn({ method: "POST" })
    .validator((data: TEditLinkCategory) => data)
    .handler(
        withServerAction(
            "editLinkCategoryAction",
            async ({ data: input }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:lien")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier des catégories"
                    }
                }

                const data = EditLinkCategorySchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const updated = await tryCatch(
                    prisma.linkCategory.update({
                        where: { id: data.id },
                        data: { name: data.name }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    return {
                        success: false,
                        error: "Échec de la modification de la catégorie."
                    }
                }

                return { success: true }
            }
        )
    )
