"use server"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export default async function updateUserInfo(
    userId: string,
    data: {
        name: string | null
        email: string
        role: "MEMBER" | "ADMIN" | "ASSO_OWNER"
    }
) {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw new Error("Unauthorized: User not found")
    }

    if (!hasRole(user, "ADMIN")) {
        throw new Error("Forbidden: Admin only")
    }

    if (!hasPermission(user, "edit:user")) {
        throw new Error("Forbidden: Insufficient permissions")
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                role: data.role
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to update user info:", error)
        return {
            success: false,
            error: "An error occurred while updating user info."
        }
    }
}
