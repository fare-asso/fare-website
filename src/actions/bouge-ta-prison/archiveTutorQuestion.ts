import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function archiveTutorQuestionImpl(
    id: number,
    context: ActionAPIContext
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:btp")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const result = await tryCatch(
        prisma.bTPTutorQuestion.update({
            where: {
                id
            },
            data: {
                archived: new Date()
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return { success: false, error: "Echec de l'archivage de la question" }
    }

    return { success: true }
}

export const archiveTutorQuestion = wrapAction(
    "archiveTutorQuestion",
    archiveTutorQuestionImpl
)
