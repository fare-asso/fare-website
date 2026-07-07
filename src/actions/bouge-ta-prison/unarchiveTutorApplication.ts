import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function unarchiveTutorApplicationImpl(id: number): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:btp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.bTPTutorApplication.update({
            where: { id },
            data: { archived: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec du désarchivage de la candidature"
        }
    }

    return { success: true }
}

const unarchiveTutorApplicationServerFn = createServerFn({ method: "POST" })
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof unarchiveTutorApplicationImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "unarchiveTutorApplication",
            unarchiveTutorApplicationImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof unarchiveTutorApplicationImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof unarchiveTutorApplicationImpl>
): ReturnType<typeof unarchiveTutorApplicationImpl> =>
    unarchiveTutorApplicationServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof unarchiveTutorApplicationImpl>
