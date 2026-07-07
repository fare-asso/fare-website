import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

export const updateLinkCategoryOrderAction = createServerFn({ method: "POST" })
    .validator((data: TOrder) => data)
    .handler(
        withServerAction(
            "updateLinkCategoryOrderAction",
            async ({ data: categoryOrder }): Promise<Result> => {
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

                const data = OrderSchema(categoryOrder)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides"
                    }
                }

                const result = await tryCatch(
                    prisma.$transaction(
                        data.map((item) =>
                            prisma.linkCategory.update({
                                where: { id: item.id },
                                data: { order: item.order }
                            })
                        )
                    )
                )
                if (!result.success) {
                    captureActionError(result.error)
                    return {
                        success: false,
                        error: "La mise à jour de l'ordre des catégories a échoué. Veuillez réessayer."
                    }
                }

                return { success: true }
            }
        )
    )
