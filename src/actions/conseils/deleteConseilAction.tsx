"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type DeleteConseilResult = { success: true } | { success: false; error: string }

async function deleteConseilActionImpl(
    _prevState: DeleteConseilResult | undefined,
    id: number
): Promise<DeleteConseilResult> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:instance")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de supprimer des conseils"
        }
    }

    const conseil = await tryCatch(prisma.conseil.findUnique({ where: { id } }))
    if (!conseil.success) {
        captureActionError(conseil.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }
    if (conseil.value === null) {
        return { success: false, error: "Conseil introuvable." }
    }

    const deleted = await tryCatch(prisma.conseil.delete({ where: { id } }))
    if (!deleted.success) {
        captureActionError(deleted.error)
        return {
            success: false,
            error: "Echec de la suppression du conseil"
        }
    }

    revalidatePath("/dashboard/elus")
    revalidatePath("/dashboard/elus/instances")
    revalidatePath("/representation/nos-elues")

    return { success: true }
}

export default withServerAction("deleteConseilAction", deleteConseilActionImpl)
