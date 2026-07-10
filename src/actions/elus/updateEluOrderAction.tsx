import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

async function updateEluOrderActionImpl(
    eluOrder: TOrder,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des élu·e·s"
        }
    }

    const data = OrderSchema(eluOrder)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    // Update all élu·e·s' order in a transaction
    const result = await tryCatch(
        prisma.$transaction(
            data.map((item) =>
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

    return { success: true }
}

export const updateEluOrderAction = wrapAction(
    "updateEluOrderAction",
    updateEluOrderActionImpl
)
