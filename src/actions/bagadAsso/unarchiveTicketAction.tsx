"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function unarchiveBagadAssoTicketActionImpl(ticketId: number): Promise<{
    success?: boolean
    error?: string
}> {
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

    try {
        await prisma.bagadAssoTicket.update({
            where: {
                id: ticketId
            },
            data: {
                deleted: null
            }
        })

        revalidatePath("/dashboard/bagadAsso")

        return { success: true }
    } catch (error) {
        captureActionError(error)
        return { error: "Echec de la désarchivation du ticket" }
    }
}

export default withServerAction(
    "unarchiveBagadAssoTicketAction",
    unarchiveBagadAssoTicketActionImpl
)
