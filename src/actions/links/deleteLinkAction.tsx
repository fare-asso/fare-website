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

type Result = { success: true } | { success: false; error: string }

async function deleteLinkActionImpl(id: number): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des liens"
        }
    }

    const deleted = await tryCatch(prisma.linkItem.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { success: false, error: "Echec de la suppression du lien" }
    }

    return { success: true }
}

const deleteLinkActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteLinkActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteLinkAction",
            deleteLinkActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteLinkActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteLinkActionImpl>
): ReturnType<typeof deleteLinkActionImpl> =>
    deleteLinkActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteLinkActionImpl>
