"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import getCurrentUserRole from "@/helpers/user/role"

interface MemberOrder {
    id: number
    order: number
}

export default async function updateMemberOrderAction(
    memberOrder: MemberOrder[]
) {
    // Verify authentication and permissions
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN") {
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }
    }

    try {
        // Update all members' order in a transaction
        await prisma.$transaction(
            memberOrder.map((item) =>
                prisma.member.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        // Revalidate paths
        revalidatePath("/dashboard/membres")
        revalidatePath("/a-propos/bureau")

        return { success: true }
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'ordre :", err)
        return {
            error: "La mise à jour de l'ordre des membres a échoué. Veuillez réessayer."
        }
    }
}
