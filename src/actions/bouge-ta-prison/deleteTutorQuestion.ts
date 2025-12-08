"use server"

import prisma from "@/helpers/db"
import { revalidatePath } from "next/cache"

export default async function deleteTutorQuestion(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    // Delete the application
    try {
        const deletedApplication = await prisma.bTPTutorQuestion.delete({
            where: {
                id
            }
        })
    } catch (error) {
        return { error: "Echec de la suppression de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
