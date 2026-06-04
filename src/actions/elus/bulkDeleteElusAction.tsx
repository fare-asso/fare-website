"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result =
    | { success: true; value: { count: number } }
    | { success: false; error: string }

async function bulkDeleteElusActionImpl(ids: number[]): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }

    if (!hasPermission(user, "delete:elu")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des éluEs"
        }
    }

    if (ids.length === 0) {
        return { success: false, error: "AucunE éluE à supprimer" }
    }

    const deleted = await tryCatch(
        prisma.elu.deleteMany({
            where: { id: { in: ids } }
        })
    )
    if (!deleted.success) {
        captureActionError(
            new Error("Erreur lors de la suppression des élus", {
                cause: deleted.error
            })
        )
        return {
            success: false,
            error: "Erreur lors de la suppression des élus"
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true, value: { count: deleted.value.count } }
}

export default withServerAction(
    "bulkDeleteElusAction",
    bulkDeleteElusActionImpl
)
