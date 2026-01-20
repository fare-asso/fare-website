import type { Permission, User, UserPermission } from "@prisma/client"
import prisma from "../db"
import { createClient } from "./server"

export type UserWithPermissions = User & {
    permissions: (UserPermission & {
        permission: Permission
    })[]
}

export async function getCurrentUserWithPermissions(): Promise<UserWithPermissions | null> {
    const supabase = await createClient()
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
