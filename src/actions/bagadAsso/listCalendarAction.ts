import type { ActionAPIContext } from "astro:actions"

import type { BagadAssoTicket } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchBagadCalendar(): Promise<BagadAssoTicket[] | null> {
    const tickets = await tryCatch(prisma.bagadAssoTicket.findMany())
    if (!tickets.success) {
        captureActionError(tickets.error)
        return null
    }
    return tickets.value
}

async function listCalendarActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: BagadAssoTicket[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

    const tickets = await fetchBagadCalendar()
    if (!tickets) {
        return { success: false, error: "Échec du chargement du calendrier." }
    }
    return { success: true, value: tickets }
}

export const listCalendarAction = wrapAction(
    "listCalendarAction",
    listCalendarActionImpl
)
