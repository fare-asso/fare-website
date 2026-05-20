"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteTutorQuestionImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    // Delete the application
    const result = await tryCatch(
        prisma.bTPTutorQuestion.delete({
            where: {
                id
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la suppression de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction("deleteTutorQuestion", deleteTutorQuestionImpl)
