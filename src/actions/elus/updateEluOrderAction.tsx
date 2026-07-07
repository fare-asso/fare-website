import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

async function updateEluOrderActionImpl(
    eluOrder: TOrder
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

    // Revalidate paths

    return { success: true }
}

const updateEluOrderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof updateEluOrderActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateEluOrderAction",
            updateEluOrderActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof updateEluOrderActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof updateEluOrderActionImpl>
): ReturnType<typeof updateEluOrderActionImpl> =>
    updateEluOrderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateEluOrderActionImpl>
