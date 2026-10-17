import type { Permission } from "@/../prisma/seed"
import type { Role, User } from "@/generated/prisma/client"

import type { UserWithPermissions } from "./supabase/auth"

export function hasRole(user: User, role: Role) {
    return user.role === role
}

export function hasPermission(
    user: UserWithPermissions | null,
    permissionName: Permission
) {
    return !!user?.permissions?.some(
        (up) => up.permission.name === permissionName
    )
}
