import type { ActionAPIContext } from "astro:actions"

import type { Adhesion } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchAdhesions(): Promise<Adhesion[] | null> {
    const adhesions = await tryCatch(
        prisma.adhesion.findMany({ orderBy: { createdAt: "desc" } })
    )
    if (!adhesions.success) {
        captureActionError(adhesions.error)
        return null
    }
    return adhesions.value
}

async function listAdhesionsActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<ActionResult<Adhesion[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:adhesions")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const adhesions = await fetchAdhesions()
    if (!adhesions) {
        return { success: false, error: "Échec du chargement des adhésions." }
    }
    return { success: true, value: adhesions }
}

export const listAdhesionsAction = wrapAction(
    "listAdhesionsAction",
    listAdhesionsActionImpl
)
