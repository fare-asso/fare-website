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
        await prisma.bagadAssoTicket.delete({
            where: {
                id: ticketId
            }
        })

        revalidatePath("/dashboard/bagadAsso")

        return { success: true }
    } catch (error: any) {
        console.error(error.message)
        return { error: "Echec de la suppression du ticket" }
    }
}
