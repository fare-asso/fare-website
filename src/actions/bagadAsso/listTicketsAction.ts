import type { ActionAPIContext } from "astro:actions"

import type { BagadAssoTicket } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchTickets(): Promise<BagadAssoTicket[] | null> {
    const tickets = await tryCatch(prisma.bagadAssoTicket.findMany())
    if (!tickets.success) {
        captureActionError(tickets.error)
        return null
    }
    return tickets.value
}

async function listTicketsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: BagadAssoTicket[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:bagad-asso")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const tickets = await fetchTickets()
    if (!tickets) {
        return { success: false, error: "Échec du chargement des tickets." }
    }
    return { success: true, value: tickets }
}

export const listTicketsAction = wrapAction(
    "listTicketsAction",
    listTicketsActionImpl
)
