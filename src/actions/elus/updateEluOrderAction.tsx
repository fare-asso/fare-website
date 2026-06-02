"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface EluOrder {
    id: number
    order: number
}

async function updateEluOrderActionImpl(
    eluOrder: EluOrder[]
): Promise<{ success: true } | { success: false; error: string }> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des élu·e·s"
        }
    }

    // Update all élu·e·s' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            eluOrder.map((item) =>
                prisma.elu.update({
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
            error: "La mise à jour de l'ordre des élu·e·s a échoué. Veuillez réessayer."
        }
    }

    // Revalidate paths
    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction(
    "updateEluOrderAction",
    updateEluOrderActionImpl
)
