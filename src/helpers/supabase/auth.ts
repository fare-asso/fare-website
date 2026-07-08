import type {
    Permission,
    User,
    UserPermission
} from "@/generated/prisma/client"

export type UserWithPermissions = User & {
    permissions: (UserPermission & {
        permission: Permission
    })[]
}
