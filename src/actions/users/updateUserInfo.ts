import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function updateUserInfoImpl(
    input: {
        userId: string
        data: {
            name: string | null
            email: string
        }
    },
    context: ActionAPIContext
) {
    const { userId, data } = input
    const user = await getUserWithPermissions(context)
    if (!user) {
        throw new Error("Unauthorized: User not found")
    }

    if (!hasRole(user, "ADMIN")) {
        throw new Error("Forbidden: Admin only")
    }

    if (!hasPermission(user, "edit:user")) {
        throw new Error("Forbidden: Insufficient permissions")
    }

    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
        return {
            success: false,
            error: "An error occurred while updating user info."
        }
    }
    return { success: true }
}

export const updateUserInfo = wrapAction("updateUserInfo", updateUserInfoImpl)
