"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

interface ConseilOrder {
    id: number
    order: number
}

async function updateConseilOrderActionImpl(conseilOrder: ConseilOrder[]) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:instance")) {
        return {
            error: "Vous n'avez pas la permission de modifier des conseils"
        }
    }

    // Update all conseils' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            conseilOrder.map((item) =>
                prisma.conseil.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            error: "La mise à jour de l'ordre des conseils a échoué. Veuillez réessayer."
        }
    }

    // Revalidate paths
    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction(
    "updateConseilOrderAction",
    updateConseilOrderActionImpl
)
