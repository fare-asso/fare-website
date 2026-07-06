import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkRestoreUsersImpl(userIds: string[]) {
    const currentUser = await getCurrentUserWithPermissions()
    if (!currentUser) {
        return { success: false, error: "Non authentifié" }
    }

    if (!hasRole(currentUser, "ADMIN")) {
        return { success: false, error: "Accès réservé aux administrateurs" }
    }

    if (!hasPermission(currentUser, "delete:user")) {
        return { success: false, error: "Permission insuffisante" }
    }

    if (userIds.length === 0) {
        return { success: false, error: "Aucun utilisateur sélectionné" }
    }

    // Restore: clear deletedAt timestamp for all selected users
    const result = await tryCatch(
        prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { deletedAt: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la restauration"
        }
    }

    return { success: true, restoredCount: userIds.length }
}

const bulkRestoreUsersServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof bulkRestoreUsersImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "bulkRestoreUsers",
            bulkRestoreUsersImpl
        )(...unpackActionArgs<Parameters<typeof bulkRestoreUsersImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof bulkRestoreUsersImpl>
): ReturnType<typeof bulkRestoreUsersImpl> =>
    bulkRestoreUsersServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof bulkRestoreUsersImpl>
