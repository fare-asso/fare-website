"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function deleteBagadAssoTicketActionImpl(ticketId: number): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-ticket")) {
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
                deleted: new Date()
            }
        })

        revalidatePath("/dashboard/bagadAsso")

        return { success: true }
    } catch (error) {
        captureActionError(error)
        return { error: "Echec de la suppression du ticket" }
    }
}

export default withServerAction(
    "deleteBagadAssoTicketAction",
    deleteBagadAssoTicketActionImpl
)
