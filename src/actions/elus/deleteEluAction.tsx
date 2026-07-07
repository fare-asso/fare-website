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

type DeleteEluResult = { success: true } | { success: false; error: string }

async function deleteEluActionImpl(id: number): Promise<DeleteEluResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des élu·e·s"
        }
    }

    const elu = await tryCatch(prisma.elu.findUnique({ where: { id } }))
    if (!elu.success) {
        captureActionError(elu.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }
    if (elu.value === null) {
        return { success: false, error: "Élu·e introuvable." }
    }

    const deleted = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }

    return { success: true }
}

const deleteEluActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteEluActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteEluAction",
            deleteEluActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteEluActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteEluActionImpl>
): ReturnType<typeof deleteEluActionImpl> =>
    deleteEluActionServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof deleteEluActionImpl
    >
