"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type RestoreEluResult = { success: true } | { success: false; error: string }

async function restoreEluActionImpl(id: number): Promise<RestoreEluResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des élu·e·s"
        }
    }

    const restored = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: null }
        })
    )
    if (!restored.success) {
        captureActionError(restored.error)
        return {
            success: false,
            error: "Echec de la restauration de l'élu·e"
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction("restoreEluAction", restoreEluActionImpl)
