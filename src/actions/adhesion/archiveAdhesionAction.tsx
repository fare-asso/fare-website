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

async function archiveAdhesionActionImpl(adhesionId: number): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:adhesion")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.adhesion.update({
            where: {
                id: adhesionId
            },
            data: {
                archived: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de l'archivage de la demande d'adhésion" }
    }

    return { success: true }
}

const archiveAdhesionActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof archiveAdhesionActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "archiveAdhesionAction",
            archiveAdhesionActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof archiveAdhesionActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof archiveAdhesionActionImpl>
): ReturnType<typeof archiveAdhesionActionImpl> =>
    archiveAdhesionActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof archiveAdhesionActionImpl>
