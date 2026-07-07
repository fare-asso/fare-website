import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { BulkImportEluSchema, type TBulkImportElu } from "@/schemas/elu"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

export const bulkImportElusAction = createServerFn({ method: "POST" })
    .validator((data: TBulkImportElu) => data)
    .handler(
        withServerAction(
            "bulkImportElus",
            async ({ data: input }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentication requise" }
                }
                if (!hasPermission(user, "create:elu")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de créer des éluEs"
                    }
                }

                const data = BulkImportEluSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides"
                    }
                }

                const conseil = await tryCatch(
                    prisma.conseil.findUnique({
                        where: { id: data.conseilId },
                        select: { id: true }
                    })
                )

                if (!conseil.success) {
                    captureActionError(conseil.error)
                    return {
                        success: false,
                        error: "Échec de l'import des éluEs"
                    }
                }

                if (conseil.value == null) {
                    return { success: false, error: "Conseil non trouvé" }
                }

                const maxOrder = await tryCatch(
                    prisma.elu.aggregate({
                        // Parmi les élus, on récupère le plus grand numéro d'ordre pour coller les nouveaux élus à la suite
                        where: { conseilId: data.conseilId, deletedAt: null },
                        _max: { order: true }
                    })
                )

                if (!maxOrder.success) {
                    captureActionError(maxOrder.error)
                    return {
                        success: false,
                        error: "Erreur lors de la recherche du dernier élu"
                    }
                }
                const startOrder = (maxOrder.value._max.order ?? -1) + 1

                const created = await tryCatch(
                    prisma.elu.createMany({
                        data: data.elus.map((elu, index) => ({
                            name: elu.name,
                            position: elu.position,
                            description: elu.description ?? null,
                            conseilId: data.conseilId,
                            order: startOrder + index
                        }))
                    })
                )

                if (!created.success) {
                    captureActionError(created.error)
                    return {
                        success: false,
                        error: "Erreur lors de la création des élus"
                    }
                }

                return { success: true, value: { count: created.value.count } }
            }
        )
    )
