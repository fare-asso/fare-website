"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export default async function bulkDeleteUsers(userIds: string[]) {
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

    // Filter out current user from deletion list
    const filteredIds = userIds.filter((id) => id !== currentUser.id)

    if (filteredIds.length === 0) {
        return {
            success: false,
            error: "Aucun utilisateur à supprimer (vous ne pouvez pas vous supprimer vous-même)"
        }
    }

    try {
        // Soft delete: set deletedAt timestamp for all selected users
        await prisma.user.updateMany({
            where: { id: { in: filteredIds } },
            data: { deletedAt: new Date() }
        })

        revalidatePath("/dashboard/users")
        return {
            success: true,
            deletedCount: filteredIds.length,
            skippedSelf: userIds.length !== filteredIds.length
        }
    } catch (error) {
        console.error("Failed to bulk delete users:", error)
        return {
            success: false,
            error: "Une erreur s'est produite lors de la suppression"
        }
    }
}
