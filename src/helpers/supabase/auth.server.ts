import type {
    Permission,
    User,
    UserPermission
} from "@/generated/prisma/client"

import prisma from "../db.server"
import { createClient } from "../supabase.server"

export type UserWithPermissions = User & {
    permissions: (UserPermission & {
        permission: Permission
    })[]
}

export async function getCurrentUserWithPermissions(): Promise<UserWithPermissions | null> {
    const supabase = createClient()
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user) return null

    // Match avec public.User, exclude soft-deleted users
    const dbUser = await prisma.user.findFirst({
        where: {
            id: user.id,
            deletedAt: null // Block soft-deleted users
        },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        }
    })

    return dbUser
}
