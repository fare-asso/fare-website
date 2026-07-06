import { createServerFn } from "@tanstack/react-start"

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

async function hardDeleteBagadAssoTicketActionImpl(ticketId: number): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:bagad-ticket")) {
        return {
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.bagadAssoTicket.delete({
            where: {
                id: ticketId
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la suppression définitive du ticket" }
    }

    return { success: true }
}

const hardDeleteBagadAssoTicketActionServerFn = createServerFn({
    method: "POST"
})
    .inputValidator(
        (
            data: ActionPayload<
                Parameters<typeof hardDeleteBagadAssoTicketActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "hardDeleteBagadAssoTicketAction",
            hardDeleteBagadAssoTicketActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof hardDeleteBagadAssoTicketActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof hardDeleteBagadAssoTicketActionImpl>
): ReturnType<typeof hardDeleteBagadAssoTicketActionImpl> =>
    hardDeleteBagadAssoTicketActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof hardDeleteBagadAssoTicketActionImpl>
