import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db.server"
import { hasPermission, hasRole } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function updateUserInfoImpl(
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

    const result = await tryCatch(
        prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                role: data.role
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

const updateUserInfoServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof updateUserInfoImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "updateUserInfo",
            updateUserInfoImpl
        )(...unpackActionArgs<Parameters<typeof updateUserInfoImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof updateUserInfoImpl>
): ReturnType<typeof updateUserInfoImpl> =>
    updateUserInfoServerFn({ data: await packActionArgs(args) }) as ReturnType<
        typeof updateUserInfoImpl
    >
