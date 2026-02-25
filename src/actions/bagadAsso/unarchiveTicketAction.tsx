"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export default async function unarchiveBagadAssoTicketAction(
    ticketId: number
): Promise<{
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
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error)
        return { error: "Echec de la désarchivation du ticket" }
    }
}
