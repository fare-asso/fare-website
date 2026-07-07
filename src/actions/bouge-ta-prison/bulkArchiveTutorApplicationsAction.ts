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
import {
    BulkArchiveTutorApplicationsSchema,
    type BulkArchiveTutorApplications
} from "@/schemas/bougeTaPrison"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkArchiveTutorApplicationsActionImpl(
    input: BulkArchiveTutorApplications
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

const bulkArchiveTutorApplicationsActionServerFn = createServerFn({
    method: "POST"
})
    .validator(
        (
            data: ActionPayload<
                Parameters<typeof bulkArchiveTutorApplicationsActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "bulkArchiveTutorApplicationsAction",
            bulkArchiveTutorApplicationsActionImpl
        )(
            ...unpackActionArgs<
                Parameters<typeof bulkArchiveTutorApplicationsActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof bulkArchiveTutorApplicationsActionImpl>
): ReturnType<typeof bulkArchiveTutorApplicationsActionImpl> =>
    bulkArchiveTutorApplicationsActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof bulkArchiveTutorApplicationsActionImpl>
