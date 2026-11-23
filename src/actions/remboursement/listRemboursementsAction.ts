import type { ActionAPIContext } from "astro:actions"

import type { Remboursement } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import type { ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function fetchRemboursements(): Promise<Remboursement[] | null> {
    const remboursements = await tryCatch(
        prisma.remboursement.findMany({ orderBy: { createdAt: "desc" } })
    )
    if (!remboursements.success) {
        captureActionError(remboursements.error)
        return null
    }
    return remboursements.value
}

export async function listRemboursementsAction(
    _input: undefined,
    context?: ActionAPIContext
): Promise<ActionResult<Remboursement[]>> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:remboursements")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const remboursements = await fetchRemboursements()
    if (!remboursements) {
        return {
            success: false,
            error: "Échec du chargement des demandes de remboursement."
        }
    }
    return { success: true, value: remboursements }
}
