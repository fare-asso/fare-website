import prisma from "@/helpers/db"
import { Permission, Role, User, UserPermission } from "@prisma/client"
import { UserWithPermissions } from "./supabase/auth"

export async function checkPermission(userId: string, permissionName: string) {
    const result = await prisma.userPermission.findFirst({
        where: {
            userId,
            permission: { name: permissionName }
        }
    })
    return Boolean(result)
}

export function hasRole(user: User, role: Role) {
    return user.role === role
}

export function hasPermission(
    user: UserWithPermissions,
    permissionName: string
) {
    return user.permissions.some((up) => up.permission.name === permissionName)
}
