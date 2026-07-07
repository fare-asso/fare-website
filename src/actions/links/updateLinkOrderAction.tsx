import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { OrderSchema, type TOrder } from "@/schemas/elu"

type Result = { success: true } | { success: false; error: string }

async function updateLinkOrderActionImpl(linkOrder: TOrder): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

const updateLinkOrderActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof updateLinkOrderActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateLinkOrderAction",
            updateLinkOrderActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof updateLinkOrderActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof updateLinkOrderActionImpl>
): ReturnType<typeof updateLinkOrderActionImpl> =>
    updateLinkOrderActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof updateLinkOrderActionImpl>
