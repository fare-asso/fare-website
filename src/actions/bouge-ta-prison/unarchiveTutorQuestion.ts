import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const unarchiveTutorQuestionAction = createServerFn({ method: "POST" })
    .validator((data: { id: number }) => data)
    .handler(
        withServerAction("unarchiveTutorQuestion", async ({ data: { id } }) => {
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
        })
    )
