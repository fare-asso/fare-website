import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function archiveTutorApplicationImpl(id: number): Promise<Result> {
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
            data: { archived: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec de l'archivage de la candidature"
        }
    }

    return { success: true }
}

const archiveTutorApplicationServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof archiveTutorApplicationImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "archiveTutorApplication",
            archiveTutorApplicationImpl
        )(
            ...unpackActionArgs<Parameters<typeof archiveTutorApplicationImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof archiveTutorApplicationImpl>
): ReturnType<typeof archiveTutorApplicationImpl> =>
    archiveTutorApplicationServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof archiveTutorApplicationImpl>
