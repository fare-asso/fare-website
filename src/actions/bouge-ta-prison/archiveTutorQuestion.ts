import prisma from "@/helpers/db"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
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

    return { success: true }
}

export const archiveTutorQuestion = wrapAction(
    "archiveTutorQuestion",
    archiveTutorQuestionImpl
)
