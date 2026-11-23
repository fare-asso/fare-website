import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import type { ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export async function deleteLinkAction(
    id: number,
    context?: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:lien")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des liens"
        }
    }

    const deleted = await tryCatch(prisma.linkItem.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { success: false, error: "Echec de la suppression du lien" }
    }

    return { success: true }
}
