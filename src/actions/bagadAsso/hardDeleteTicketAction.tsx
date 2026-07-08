import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function hardDeleteBagadAssoTicketActionImpl(
    ticketId: number,
    context: ActionAPIContext
): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-ticket")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.bagadAssoTicket.delete({
            where: {
                id: ticketId
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la suppression définitive du ticket" }
    }

    return { success: true }
}

export const hardDeleteBagadAssoTicketAction = wrapAction(
    "hardDeleteBagadAssoTicketAction",
    hardDeleteBagadAssoTicketActionImpl
)
