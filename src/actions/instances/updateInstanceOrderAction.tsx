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

async function updateInstanceOrderActionImpl(
    instanceOrder: TOrder
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

    // Revalidate paths

    return { success: true }
}

const updateInstanceOrderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof updateInstanceOrderActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateInstanceOrderAction",
            updateInstanceOrderActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof updateInstanceOrderActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof updateInstanceOrderActionImpl>
): ReturnType<typeof updateInstanceOrderActionImpl> =>
    updateInstanceOrderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateInstanceOrderActionImpl>
