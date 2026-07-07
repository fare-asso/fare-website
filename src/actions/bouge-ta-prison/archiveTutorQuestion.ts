import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const archiveTutorQuestionAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction("archiveTutorQuestion", async ({ data: { id } }) => {
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
        })
    )
