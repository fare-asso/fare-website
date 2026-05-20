"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function archiveTutorQuestionImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    const result = await tryCatch(
        prisma.bTPTutorQuestion.update({
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
        return { error: "Echec de l'archivage de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison/questions")
    return { success: true }
}

export default withServerAction(
    "archiveTutorQuestion",
    archiveTutorQuestionImpl
)
