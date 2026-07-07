import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditEluSchema, type TEditElu } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

export const editEluAction = createServerFn({ method: "POST" })
    .validator((data: TEditElu) => data)
    .handler(
        withServerAction(
            "editElu",
            async ({ data: input }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:elu")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier des élu·e·s"
                    }
                }

                const data = EditEluSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
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
                        error: "Échec de la modification de l'élu·e."
                    }
                }
                if (conseil.value === null) {
                    return { success: false, error: "Conseil introuvable." }
                }

                const updated = await tryCatch(
                    prisma.elu.update({
                        where: { id: data.id },
                        data: {
                            name: data.name,
                            position: data.position,
                            description: data.description ?? null,
                            conseilId: data.conseilId
                        }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    return {
                        success: false,
                        error: "Échec de la modification de l'élu·e."
                    }
                }

                return { success: true }
            }
        )
    )
