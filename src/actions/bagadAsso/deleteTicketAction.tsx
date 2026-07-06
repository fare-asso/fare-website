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

async function deleteBagadAssoTicketActionImpl(ticketId: number): Promise<{
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
        prisma.bagadAssoTicket.update({
            where: {
                id: ticketId
            },
            data: {
                deleted: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la suppression du ticket" }
    }

    return { success: true }
}

const deleteBagadAssoTicketActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (
            data: ActionPayload<
                Parameters<typeof deleteBagadAssoTicketActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteBagadAssoTicketAction",
            deleteBagadAssoTicketActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof deleteBagadAssoTicketActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof deleteBagadAssoTicketActionImpl>
): ReturnType<typeof deleteBagadAssoTicketActionImpl> =>
    deleteBagadAssoTicketActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteBagadAssoTicketActionImpl>
