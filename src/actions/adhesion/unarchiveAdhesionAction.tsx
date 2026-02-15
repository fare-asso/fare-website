"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import getCurrentUserRole from "@/helpers/user/role"

export default async function unarchiveAdhesionAction(
    adhesionId: number
): Promise<{
    success?: boolean
    error?: string
}> {
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    try {
        await prisma.adhesion.update({
            where: {
                id: adhesionId
            },
            data: {
                archived: null
            }
        })

        revalidatePath("/dashboard/adhesions")

        return { success: true }
    } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : error)
        return { error: "Echec de la désarchivation de la demande d'adhésion" }
    }
}
