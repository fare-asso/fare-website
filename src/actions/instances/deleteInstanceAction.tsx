import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

type DeleteInstanceResult =
    | { success: true }
    | { success: false; error: string }

export const deleteInstanceAction = createServerFn({ method: "POST" })
    .validator((data: number) => data)
    .handler(
        withServerAction(
            "deleteInstance",
            async ({ data: id }): Promise<DeleteInstanceResult> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "delete:instance")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de supprimer des instances"
                    }
                }

                const supabase = createClient()

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

                const deleted = await tryCatch(
                    prisma.instance.delete({ where: { id } })
                )
                if (!deleted.success) {
                    captureActionError(deleted.error)
                    return {
                        success: false,
                        error: "Echec de la suppression de l'instance"
                    }
                }

                return { success: true }
            }
        )
    )
