import { createServerFn } from "@tanstack/react-start"

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

async function unarchiveBagadAssoTicketActionImpl(ticketId: number): Promise<{
    success?: boolean
    error?: string
}> {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:bagad-ticket")) {
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
                deleted: null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { error: "Echec de la désarchivation du ticket" }
    }

    return { success: true }
}

const unarchiveBagadAssoTicketActionServerFn = createServerFn({
    method: "POST"
})
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof unarchiveBagadAssoTicketActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "unarchiveBagadAssoTicketAction",
            unarchiveBagadAssoTicketActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof unarchiveBagadAssoTicketActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof unarchiveBagadAssoTicketActionImpl>
): ReturnType<typeof unarchiveBagadAssoTicketActionImpl> =>
    unarchiveBagadAssoTicketActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof unarchiveBagadAssoTicketActionImpl>
