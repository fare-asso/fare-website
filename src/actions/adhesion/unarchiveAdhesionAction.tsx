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

async function unarchiveAdhesionActionImpl(adhesionId: number): Promise<{
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
                archived: null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la désarchivation de la demande d'adhésion" }
    }

    return { success: true }
}

const unarchiveAdhesionActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof unarchiveAdhesionActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "unarchiveAdhesionAction",
            unarchiveAdhesionActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof unarchiveAdhesionActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof unarchiveAdhesionActionImpl>
): ReturnType<typeof unarchiveAdhesionActionImpl> =>
    unarchiveAdhesionActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof unarchiveAdhesionActionImpl>
