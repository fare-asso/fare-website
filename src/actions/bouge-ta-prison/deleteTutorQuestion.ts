"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function deleteTutorQuestionImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    // Delete the application
    try {
        await prisma.bTPTutorQuestion.delete({
            where: {
                id
            }
        })
    } catch (error) {
        captureActionError(error)
        return { error: "Echec de la suppression de la question" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction("deleteTutorQuestion", deleteTutorQuestionImpl)
