import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
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

const archiveTutorQuestionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof archiveTutorQuestionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "archiveTutorQuestion",
            archiveTutorQuestionImpl
        )(
            ...unpackActionArgs<Parameters<typeof archiveTutorQuestionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof archiveTutorQuestionImpl>
): ReturnType<typeof archiveTutorQuestionImpl> =>
    archiveTutorQuestionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof archiveTutorQuestionImpl>
