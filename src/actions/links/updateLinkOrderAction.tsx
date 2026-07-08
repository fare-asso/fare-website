import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

async function updateLinkOrderActionImpl(
    linkOrder: TOrder,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des liens"
        }
    }

    const data = OrderSchema(linkOrder)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    const result = await tryCatch(
        prisma.$transaction(
            data.map((item) =>
                prisma.linkItem.update({
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
            error: "La mise à jour de l'ordre des liens a échoué. Veuillez réessayer."
        }
    }

    return { success: true }
}

export const updateLinkOrderAction = wrapAction(
    "updateLinkOrderAction",
    updateLinkOrderActionImpl
)
