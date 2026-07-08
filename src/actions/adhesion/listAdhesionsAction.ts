import type { ActionAPIContext } from "astro:actions"

import type { Adhesion } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
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
): Promise<
    { success: true; value: Adhesion[] } | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

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
