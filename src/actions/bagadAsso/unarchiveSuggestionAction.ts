import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function unarchiveSuggestionActionImpl(
    suggestionId: number,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:bagad-suggestion")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.bagadAssoSuggestion.update({
            where: { id: suggestionId },
            data: { archived: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Échec du désarchivage de la suggestion"
        }
    }

    return { success: true }
}

export const unarchiveSuggestionAction = wrapAction(
    "unarchiveSuggestionAction",
    unarchiveSuggestionActionImpl
)
