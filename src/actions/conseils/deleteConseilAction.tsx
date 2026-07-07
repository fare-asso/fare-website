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

type DeleteConseilResult = { success: true } | { success: false; error: string }

async function deleteConseilActionImpl(
    id: number
): Promise<DeleteConseilResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des conseils"
        }
    }

    const conseil = await tryCatch(prisma.conseil.findUnique({ where: { id } }))
    if (!conseil.success) {
        captureActionError(conseil.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }
    if (conseil.value === null) {
        return { success: false, error: "Conseil introuvable." }
    }

    const eluCount = await tryCatch(
        prisma.elu.count({ where: { conseilId: id, deletedAt: null } })
    )
    if (!eluCount.success) {
        captureActionError(eluCount.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }
    if (eluCount.value > 0) {
        return {
            success: false,
            error: "Supprimez d'abord les éluEs de ce conseil avant de le supprimer."
        }
    }

    const deleted = await tryCatch(prisma.conseil.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }

    return { success: true }
}

const deleteConseilActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteConseilActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteConseilAction",
            deleteConseilActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteConseilActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteConseilActionImpl>
): ReturnType<typeof deleteConseilActionImpl> =>
    deleteConseilActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteConseilActionImpl>
