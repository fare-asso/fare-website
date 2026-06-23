"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type Result = { success: true } | { success: false; error: string }

async function archiveTutorApplicationImpl(id: number): Promise<Result> {
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
            data: { archived: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Echec de l'archivage de la candidature"
        }
    }

    revalidatePath("/dashboard/bouge-ta-prison")
    return { success: true }
}

export default withServerAction(
    "archiveTutorApplication",
    archiveTutorApplicationImpl
)
