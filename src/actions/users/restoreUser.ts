"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function restoreUserImpl(userId: string) {
    const currentUser = await getCurrentUserWithPermissions()
    if (!currentUser) {
        return { success: false, error: "Non authentifié" }
    }

    if (!hasRole(currentUser, "ADMIN")) {
        return { success: false, error: "Accès réservé aux administrateurs" }
    }

    if (!hasPermission(currentUser, "delete:user")) {
        return { success: false, error: "Permission insuffisante" }
    }

    try {
        // Restore: clear deletedAt timestamp
        await prisma.user.update({
            where: { id: userId },
            data: { deletedAt: null }
        })

        revalidatePath("/dashboard/users")
        return { success: true }
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la restauration"
        }
    }
}

export default withServerAction("restoreUser", restoreUserImpl)
