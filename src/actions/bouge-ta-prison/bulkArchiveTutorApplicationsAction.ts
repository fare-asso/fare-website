import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    BulkArchiveTutorApplicationsSchema,
    type BulkArchiveTutorApplications
} from "@/schemas/bougeTaPrison"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkArchiveTutorApplicationsActionImpl(
    input: BulkArchiveTutorApplications,
    context: ActionAPIContext
): Promise<Result> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:btp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const parsed = BulkArchiveTutorApplicationsSchema(input)
    if (parsed instanceof type.errors) {
        return { success: false, error: "Sélection invalide." }
    }

    const updated = await tryCatch(
        prisma.bTPTutorApplication.updateMany({
            where: { id: { in: parsed.ids } },
            data: { archived: parsed.archive ? new Date() : null }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return {
            success: false,
            error: parsed.archive
                ? "Echec de l'archivage des candidatures"
                : "Echec du désarchivage des candidatures"
        }
    }

    return { success: true, value: { count: updated.value.count } }
}

export const bulkArchiveTutorApplicationsAction = wrapAction(
    "bulkArchiveTutorApplicationsAction",
    bulkArchiveTutorApplicationsActionImpl
)
