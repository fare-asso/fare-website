import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const deleteTutorQuestionAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction("deleteTutorQuestion", async ({ data: { id } }) => {
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
        })
    )
