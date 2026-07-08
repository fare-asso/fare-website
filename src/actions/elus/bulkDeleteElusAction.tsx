import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { BulkDeleteElusSchema, type TBulkDeleteElus } from "@/schemas/elu"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkDeleteElusActionImpl(
    ids: TBulkDeleteElus,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
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

export const bulkDeleteElusAction = wrapAction(
    "bulkDeleteElusAction",
    bulkDeleteElusActionImpl
)
