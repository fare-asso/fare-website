"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeleteInstanceResult =
    | { success: true }
    | { success: false; error: string }

async function deleteInstanceActionImpl(
    _prevState: DeleteInstanceResult | undefined,
    id: number
): Promise<DeleteInstanceResult> {
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

    const supabase = await createClient()

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

    if (instance.value.logoPath && instance.value.logoPath.length > 0) {
        const removed = await tryCatch(
            supabase.storage
                .from("instance-pictures")
                .remove([instance.value.logoPath])
        )
        if (!removed.success) {
            captureActionError(removed.error)
            return {
                success: false,
                error: "Echec de la suppression du logo de l'instance"
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

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction(
    "deleteInstanceAction",
    deleteInstanceActionImpl
)
