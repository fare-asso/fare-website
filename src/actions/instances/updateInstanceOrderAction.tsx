"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface InstanceOrder {
    id: number
    order: number
}

async function updateInstanceOrderActionImpl(
    instanceOrder: InstanceOrder[]
): Promise<{ success: true } | { success: false; error: string }> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des instances"
        }
    }

    // Update all instances' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            instanceOrder.map((item) =>
                prisma.instance.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "La mise à jour de l'ordre des instances a échoué. Veuillez réessayer."
        }
    }

    // Revalidate paths
    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction(
    "updateInstanceOrderAction",
    updateInstanceOrderActionImpl
)
