import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

const deleteTutorQuestionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteTutorQuestionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteTutorQuestion",
            deleteTutorQuestionImpl
        )(...unpackActionArgs<Parameters<typeof deleteTutorQuestionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteTutorQuestionImpl>
): ReturnType<typeof deleteTutorQuestionImpl> =>
    deleteTutorQuestionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteTutorQuestionImpl>
