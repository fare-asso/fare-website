import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteBagadAssoTicketActionImpl(
    ticketId: number,
    context: ActionAPIContext
): Promise<ActionResult> {
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
        prisma.bagadAssoTicket.update({
            where: {
                id: ticketId
            },
            data: {
                deleted: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false, error: "Echec de la suppression du ticket" }
    }

    return { success: true }
}

export const deleteBagadAssoTicketAction = wrapAction(
    "deleteBagadAssoTicketAction",
    deleteBagadAssoTicketActionImpl
)
