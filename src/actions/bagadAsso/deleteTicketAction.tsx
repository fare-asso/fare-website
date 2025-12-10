"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import getCurrentUserRole from "@/helpers/user/role"

export default async function deleteBagadAssoTicketAction(
    ticketId: number
): Promise<{
    success?: boolean
    error?: string
}> {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
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
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error)
        return { error: "Echec de la suppression du ticket" }
    }
}
