"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function archiveTutorApplicationImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    const result = await tryCatch(
        prisma.bTPTutorApplication.update({
            where: {
                id
            },
            data: {
                archived: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de l'archivage de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "archiveTutorApplication",
    archiveTutorApplicationImpl
)
