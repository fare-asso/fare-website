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

const unarchiveTutorQuestionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof unarchiveTutorQuestionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "unarchiveTutorQuestion",
            unarchiveTutorQuestionImpl
        )(
            ...unpackActionArgs<Parameters<typeof unarchiveTutorQuestionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof unarchiveTutorQuestionImpl>
): ReturnType<typeof unarchiveTutorQuestionImpl> =>
    unarchiveTutorQuestionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof unarchiveTutorQuestionImpl>
