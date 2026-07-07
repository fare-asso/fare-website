import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function bulkDeleteUsersImpl(userIds: string[]) {
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

    // Filter out current user from deletion list
    const filteredIds = userIds.filter((id) => id !== currentUser.id)

    if (filteredIds.length === 0) {
        return {
            success: false,
            error: "Aucun utilisateur à supprimer (vous ne pouvez pas vous supprimer vous-même)"
        }
    }

    // Soft delete: set deletedAt timestamp for all selected users
    const result = await tryCatch(
        prisma.user.updateMany({
            where: { id: { in: filteredIds } },
            data: { deletedAt: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        }
    }

    return {
        success: true,
        deletedCount: filteredIds.length,
        skippedSelf: userIds.length !== filteredIds.length
    }
}

const bulkDeleteUsersServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof bulkDeleteUsersImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "bulkDeleteUsers",
            bulkDeleteUsersImpl
        )(...unpackActionArgs<Parameters<typeof bulkDeleteUsersImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof bulkDeleteUsersImpl>
): ReturnType<typeof bulkDeleteUsersImpl> =>
    bulkDeleteUsersServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof bulkDeleteUsersImpl
    >
