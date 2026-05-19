"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function unarchiveTutorQuestionImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.bTPTutorQuestion.update({
            where: {
                id
            },
            data: {
                archived: null
            }
        })
    } catch (error) {
        captureActionError(error)
        return { error: "Echec du désarchivage de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison/questions")
    return { success: true }
}

export default withServerAction(
    "unarchiveTutorQuestion",
    unarchiveTutorQuestionImpl
)
