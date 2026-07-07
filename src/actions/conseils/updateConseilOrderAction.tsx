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

async function updateConseilOrderActionImpl(
    conseilOrder: TOrder
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des conseils"
        }
    }

    const data = OrderSchema(conseilOrder)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    const result = await tryCatch(
        prisma.$transaction(
            data.map((item) =>
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
            success: false,
            error: "La mise à jour de l'ordre des conseils a échoué. Veuillez réessayer."
        }
    }

    return { success: true }
}

const updateConseilOrderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (
            data: ActionPayload<Parameters<typeof updateConseilOrderActionImpl>>
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateConseilOrderAction",
            updateConseilOrderActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof updateConseilOrderActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof updateConseilOrderActionImpl>
): ReturnType<typeof updateConseilOrderActionImpl> =>
    updateConseilOrderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateConseilOrderActionImpl>
