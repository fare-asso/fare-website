import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function unarchiveTutorQuestionImpl(
    id: number,
    context: ActionAPIContext
): Promise<ActionResult> {
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
                archived: null
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec du désarchivage de la question"
        }
    }

    return { success: true }
}

export const unarchiveTutorQuestion = wrapAction(
    "unarchiveTutorQuestion",
    unarchiveTutorQuestionImpl
)
