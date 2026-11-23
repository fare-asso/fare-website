import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import type { ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function archiveRemboursementAction(
    remboursementId: number,
    context?: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:remboursement")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.remboursement.update({
            where: { id: remboursementId },
            data: { archived: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Échec de l'archivage de la demande de remboursement"
        }
    }

    return { success: true }
}
