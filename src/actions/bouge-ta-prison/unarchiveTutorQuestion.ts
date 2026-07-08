import prisma from "@/helpers/db"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
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

    return { success: true }
}

export const unarchiveTutorQuestion = wrapAction(
    "unarchiveTutorQuestion",
    unarchiveTutorQuestionImpl
)
