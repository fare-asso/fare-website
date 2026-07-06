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

async function deleteUserImpl(userId: string) {
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

    // Prevent self-deletion
    if (currentUser.id === userId) {
        return {
            success: false,
            error: "Vous ne pouvez pas supprimer votre propre compte"
        }
    }

    // Soft delete: set deletedAt timestamp
    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
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

    return { success: true }
}

const deleteUserServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof deleteUserImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteUser",
            deleteUserImpl
        )(...unpackActionArgs<Parameters<typeof deleteUserImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteUserImpl>
): ReturnType<typeof deleteUserImpl> =>
    deleteUserServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof deleteUserImpl
    >
