import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const unarchiveBagadAssoTicketAction = createServerFn({
    method: "POST"
})
    .validator((data: { ticketId: number }) => data)
    .handler(
        withServerAction(
            "unarchiveBagadAssoTicketAction",
            async ({
                data: { ticketId }
            }): Promise<{ success?: boolean; error?: string }> => {
                // Auth and permission verifications
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:bagad-ticket")) {
                    return {
                        error: "Vous n'avez pas la permission d'effectuer cette opération"
                    }
                }

                const result = await tryCatch(
                    prisma.bagadAssoTicket.update({
                        where: {
                            id: ticketId
                        },
                        data: {
                            deleted: null
                        }
                    })
                )
                if (!result.success) {
                    captureActionError(result.error)
                    return { error: "Echec de la désarchivation du ticket" }
                }

                return { success: true }
            }
        )
    )
