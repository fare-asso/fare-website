import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function unarchiveTutorApplicationImpl(
    id: number,
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

    const result = await tryCatch(
        prisma.bTPTutorApplication.update({
            where: { id },
            data: { archived: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec du désarchivage de la candidature"
        }
    }

    return { success: true }
}

export const unarchiveTutorApplication = wrapAction(
    "unarchiveTutorApplication",
    unarchiveTutorApplicationImpl
)
