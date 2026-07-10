import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeleteInstanceResult =
    | { success: true }
    | { success: false; error: string }

async function deleteInstanceActionImpl(
    id: number,
    context: ActionAPIContext
): Promise<DeleteInstanceResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des instances"
        }
    }

    const supabase = createClient(context)

    const instance = await tryCatch(
        prisma.instance.findUnique({ where: { id } })
    )
    if (!instance.success) {
        captureActionError(instance.error)
        return {
            success: false,
            error: "Echec de la suppression de l'instance"
        }
    }
    if (instance.value === null) {
        return { success: false, error: "Instance introuvable." }
    }

    const conseilCount = await tryCatch(
        prisma.conseil.count({ where: { instanceId: id } })
    )
    if (!conseilCount.success) {
        captureActionError(conseilCount.error)
        return {
            success: false,
            error: "Echec de la suppression de l'instance"
        }
    }
    if (conseilCount.value > 0) {
        return {
            success: false,
            error: "Supprimez d'abord les conseils de cette instance avant de la supprimer."
        }
    }

    if (instance.value.logoPaths.length > 0) {
        const removed = await tryCatch(
            supabase.storage
                .from("instance-pictures")
                .remove(instance.value.logoPaths)
        )
        if (!removed.success) {
            captureActionError(removed.error)
            return {
                success: false,
                error: "Echec de la suppression des logos de l'instance"
            }
        }
    }

    const deleted = await tryCatch(prisma.instance.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'instance"
        }
    }

    return { success: true }
}

export const deleteInstanceAction = wrapAction(
    "deleteInstanceAction",
    deleteInstanceActionImpl
)
