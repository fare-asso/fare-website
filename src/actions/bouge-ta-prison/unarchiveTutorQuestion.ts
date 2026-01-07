"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"

export default async function unarchiveTutorQuestion(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.bTPTutorQuestion.update({
            where: {
                id
            },
            data: {
                archived: null
            }
        })
    } catch (_error) {
        return { error: "Echec du désarchivage de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison/questions")
    return { success: true }
}
