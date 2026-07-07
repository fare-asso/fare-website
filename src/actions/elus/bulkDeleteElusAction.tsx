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
import { BulkDeleteElusSchema, type TBulkDeleteElus } from "@/schemas/elu"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkDeleteElusActionImpl(ids: TBulkDeleteElus): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }

    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des éluEs"
        }
    }

    const data = BulkDeleteElusSchema(ids)
    if (data instanceof type.errors) {
        return { success: false, error: "Liste d'identifiants invalide" }
    }

    if (data.length === 0) {
        return { success: false, error: "AucunE éluE à supprimer" }
    }

    const deleted = await tryCatch(
        prisma.elu.updateMany({
            where: { id: { in: data } },
            data: { deletedAt: new Date() }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Erreur lors de la suppression des élus"
        }
    }

    return { success: true, value: { count: deleted.value.count } }
}

const bulkDeleteElusActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof bulkDeleteElusActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "bulkDeleteElusAction",
            bulkDeleteElusActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof bulkDeleteElusActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof bulkDeleteElusActionImpl>
): ReturnType<typeof bulkDeleteElusActionImpl> =>
    bulkDeleteElusActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof bulkDeleteElusActionImpl>
