import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    SetTicketValidatedSchema,
    type TSetTicketValidated
} from "@/schemas/bagadTicket"

async function setTicketValidatedActionImpl(
    input: TSetTicketValidated,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:bagad-ticket")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const data = SetTicketValidatedSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const result = await tryCatch(
        prisma.bagadAssoTicket.update({
            where: {
                id: data.ticketId
            },
            data: {
                validated: data.validated ? new Date() : null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false, error: "Echec de la mise à jour du ticket" }
    }

    return { success: true }
}

export const setTicketValidatedAction = wrapAction(
    "setTicketValidatedAction",
    setTicketValidatedActionImpl
)
