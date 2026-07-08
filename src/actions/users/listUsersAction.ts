import type { ActionAPIContext } from "astro:actions"

import type {
    Permission,
    User,
    UserPermission
} from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type UserWithPermissionsRow = User & {
    permissions: (UserPermission & { permission: Permission })[]
    deletedAt: Date | null
}

export async function fetchUsers(
    showDeleted: boolean
): Promise<UserWithPermissionsRow[] | null> {
    const users = await tryCatch(
        prisma.user.findMany({
            where: showDeleted ? {} : { deletedAt: null },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
    )
    if (!users.success) {
        captureActionError(users.error)
        return null
    }
    return users.value as unknown as UserWithPermissionsRow[]
}

async function listUsersActionImpl(
    input: { showDeleted: boolean },
    context: ActionAPIContext
): Promise<
    | { success: true; value: UserWithPermissionsRow[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:users")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const users = await fetchUsers(input.showDeleted)
    if (!users) {
        return {
            success: false,
            error: "Échec du chargement des utilisateurs."
        }
    }
    return { success: true, value: users }
}

export const listUsersAction = wrapAction(
    "listUsersAction",
    listUsersActionImpl
)
