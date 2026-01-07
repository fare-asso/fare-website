"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"

export default async function unarchiveTutorApplication(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.bTPTutorApplication.update({
            where: {
                id
            },
            data: {
                archived: null
            }
        })
    } catch (_error) {
        return { error: "Echec du désarchivage de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
