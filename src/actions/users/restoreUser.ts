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

async function restoreUserImpl(userId: string) {
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

    // Restore: clear deletedAt timestamp
    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
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

    return { success: true }
}

const restoreUserServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof restoreUserImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "restoreUser",
            restoreUserImpl
        )(...unpackActionArgs<Parameters<typeof restoreUserImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof restoreUserImpl>
): ReturnType<typeof restoreUserImpl> =>
    restoreUserServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof restoreUserImpl
    >
