import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

async function updateInstanceOrderActionImpl(
    instanceOrder: TOrder,
    context: ActionAPIContext
): Promise<{ success: true } | { success: false; error: string }> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des instances"
        }
    }

    // Validate the untrusted client input before touching the database
    const data = OrderSchema(instanceOrder)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    // Update all instances' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            data.map((item) =>
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

    return { success: true }
}

export const updateInstanceOrderAction = wrapAction(
    "updateInstanceOrderAction",
    updateInstanceOrderActionImpl
)
