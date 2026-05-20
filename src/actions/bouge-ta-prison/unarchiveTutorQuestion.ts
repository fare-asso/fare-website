"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function unarchiveTutorQuestionImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    const result = await tryCatch(
        prisma.bTPTutorQuestion.update({
            where: {
                id
            },
            data: {
                archived: null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec du désarchivage de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison/questions")
    return { success: true }
}

export default withServerAction(
    "unarchiveTutorQuestion",
    unarchiveTutorQuestionImpl
)
