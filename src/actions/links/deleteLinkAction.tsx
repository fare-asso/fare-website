"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function deleteLinkActionImpl(
    _prevState: Result | undefined,
    id: number
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
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

    revalidatePath("/dashboard/liens")
    revalidatePath("/liens")
    return { success: true }
}

export default withServerAction("deleteLinkAction", deleteLinkActionImpl)
