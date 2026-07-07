import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const updateUserInfoAction = createServerFn({ method: "POST" })
    .validator(
        (data: {
            userId: string
            info: {
                name: string | null
                email: string
                role: "MEMBER" | "ADMIN" | "ASSO_OWNER"
            }
        }) => data
    )
    .handler(
        withServerAction(
            "updateUserInfo",
            async ({ data: { userId, info } }) => {
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

                const result = await tryCatch(
                    prisma.user.update({
                        where: { id: userId },
                        data: {
                            name: info.name,
                            email: info.email,
                            role: info.role
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
        )
    )
