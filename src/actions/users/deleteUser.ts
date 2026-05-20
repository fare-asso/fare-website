"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteUserImpl(userId: string) {
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

    // Prevent self-deletion
    if (currentUser.id === userId) {
        return {
            success: false,
            error: "Vous ne pouvez pas supprimer votre propre compte"
        }
    }

    // Soft delete: set deletedAt timestamp
    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date() }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        }
    }

    revalidatePath("/dashboard/users")
    return { success: true }
}

export default withServerAction("deleteUser", deleteUserImpl)
