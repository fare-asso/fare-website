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

async function updateUserPermissionsImpl(
    userId: string,
    permissions: number[]
) {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw new Error("Unauthorized: User not found")
    }

    if (!hasRole(user, "ADMIN")) {
        throw new Error("Forbidden: Admin only")
    }

    if (!hasPermission(user, "edit:user-permissions")) {
        throw new Error("Forbidden: Insufficient permissions")
    }

    // Commencer une transaction pour supprimer les anciennes permissions et ajouter les nouvelles
    const result = await tryCatch(
        prisma.$transaction(async (tx) => {
            // Supprimer les permissions existantes pour cet utilisateur
            await tx.userPermission.deleteMany({
                where: {
                    userId
                }
            })

            // Ajouter les nouvelles permissions
            const newPermissions = permissions.map((permissionId) => ({
                userId,
                permissionId
            }))

            await tx.userPermission.createMany({
                data: newPermissions,
                skipDuplicates: true
            })
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "An error occurred while updating permissions."
        }
    }

    return { success: true }
}

const updateUserPermissionsServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof updateUserPermissionsImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateUserPermissions",
            updateUserPermissionsImpl
        )(
            ...unpackActionArgs<Parameters<typeof updateUserPermissionsImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof updateUserPermissionsImpl>
): ReturnType<typeof updateUserPermissionsImpl> =>
    updateUserPermissionsServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateUserPermissionsImpl>
