import type { ActionAPIContext } from "astro:actions"

import type { BagadAssoSuggestion } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchSuggestions(): Promise<
    BagadAssoSuggestion[] | null
> {
    const suggestions = await tryCatch(
        prisma.bagadAssoSuggestion.findMany({
            orderBy: { creationDate: "desc" }
        })
    )
    if (!suggestions.success) {
        captureActionError(suggestions.error)
        return null
    }
    return suggestions.value
}

async function listSuggestionsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<BagadAssoSuggestion[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:bagad-asso")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const suggestions = await fetchSuggestions()
    if (!suggestions) {
        return { success: false, error: "Échec du chargement des suggestions." }
    }
    return { success: true, value: suggestions }
}

export const listSuggestionsAction = wrapAction(
    "listSuggestionsAction",
    listSuggestionsActionImpl
)
