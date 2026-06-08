"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeleteEluResult = { success: true } | { success: false; error: string }

async function deleteEluActionImpl(
    _prevState: DeleteEluResult | undefined,
    id: number
): Promise<DeleteEluResult> {
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

    const elu = await tryCatch(prisma.elu.findUnique({ where: { id } }))
    if (!elu.success) {
        captureActionError(elu.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }
    if (elu.value === null) {
        return { success: false, error: "Élu·e introuvable." }
    }

    const deleted = await tryCatch(
        prisma.elu.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression de l'élu·e"
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction("deleteEluAction", deleteEluActionImpl)
