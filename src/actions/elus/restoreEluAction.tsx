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

type RestoreEluResult = { success: true } | { success: false; error: string }

async function restoreEluActionImpl(id: number): Promise<RestoreEluResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des élu·e·s"
        }
    }

    const restored = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: null }
        })
    )
    if (!restored.success) {
        captureActionError(restored.error)
        return {
            success: false,
            error: "Echec de la restauration de l'élu·e"
        }
    }

    return { success: true }
}

const restoreEluActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof restoreEluActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "restoreEluAction",
            restoreEluActionImpl
        )(...unpackActionArgs<Parameters<typeof restoreEluActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof restoreEluActionImpl>
): ReturnType<typeof restoreEluActionImpl> =>
    restoreEluActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof restoreEluActionImpl>
