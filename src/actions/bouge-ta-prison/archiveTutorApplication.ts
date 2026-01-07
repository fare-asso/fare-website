"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"

export default async function archiveTutorApplication(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.bTPTutorApplication.update({
            where: {
                id
            },
            data: {
                archived: new Date()
            }
        })
    } catch (_error) {
        return { error: "Echec de l'archivage de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}
