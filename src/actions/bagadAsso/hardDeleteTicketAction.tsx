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
): Promise<{ success: true } | { success: false; error: string }> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-ticket")) {
        return {
            success: false,
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
        return {
            success: false,
            error: "Echec de la suppression définitive du ticket"
        }
    }

    return { success: true }
}

export const hardDeleteBagadAssoTicketAction = wrapAction(
    "hardDeleteBagadAssoTicketAction",
    hardDeleteBagadAssoTicketActionImpl
)
