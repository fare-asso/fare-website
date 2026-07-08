import prisma from "@/helpers/db"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
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

    return { success: true }
}

export const deleteTutorQuestion = wrapAction(
    "deleteTutorQuestion",
    deleteTutorQuestionImpl
)
