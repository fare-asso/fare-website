"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"

export default async function deleteTutorQuestion(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    // Delete the application
    try {
        const _deletedApplication = await prisma.bTPTutorQuestion.delete({
            where: {
                id
            }
        })
    } catch (_error) {
        return { error: "Echec de la suppression de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
