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

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkRestoreElusActionImpl(ids: number[]): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }

    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des éluEs"
        }
    }

    if (ids.length === 0) {
        return { success: false, error: "AucunE éluE à restaurer" }
    }

    const restored = await tryCatch(
        prisma.elu.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null }
        })
    )
    if (!restored.success) {
        captureActionError(restored.error)
        return {
            success: false,
            error: "Erreur lors de la restauration des élus"
        }
    }

    return { success: true, value: { count: restored.value.count } }
}

const bulkRestoreElusActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof bulkRestoreElusActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "bulkRestoreElusAction",
            bulkRestoreElusActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof bulkRestoreElusActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof bulkRestoreElusActionImpl>
): ReturnType<typeof bulkRestoreElusActionImpl> =>
    bulkRestoreElusActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof bulkRestoreElusActionImpl>
