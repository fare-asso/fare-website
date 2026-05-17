"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function unarchiveTutorApplicationImpl(
    id: number
): Promise<{ success?: boolean; error?: string }> {
    try {
        await prisma.bTPTutorApplication.update({
            where: {
                id
            },
            data: {
                archived: null
            }
        })
    } catch (error) {
        captureActionError(error)
        return { error: "Echec du désarchivage de la candidature" }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "unarchiveTutorApplication",
    unarchiveTutorApplicationImpl
)
