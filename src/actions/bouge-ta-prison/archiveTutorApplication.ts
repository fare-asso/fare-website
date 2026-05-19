"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function archiveTutorApplicationImpl(
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
    } catch (error) {
        captureActionError(error)
        return { error: "Echec de l'archivage de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "archiveTutorApplication",
    archiveTutorApplicationImpl
)
