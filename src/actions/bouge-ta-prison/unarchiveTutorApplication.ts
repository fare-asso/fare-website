"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function unarchiveTutorApplicationImpl(id: number): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "access:btp")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission d'effectuer cette opération"
        }
    }

    const result = await tryCatch(
        prisma.bTPTutorApplication.update({
            where: { id },
            data: { archived: null }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec du désarchivage de la candidature"
        }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "unarchiveTutorApplication",
    unarchiveTutorApplicationImpl
)
