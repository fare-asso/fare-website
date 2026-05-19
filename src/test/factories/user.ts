import type { Role } from "@/generated/prisma/client"
import type { UserWithPermissions } from "@/helpers/supabase/auth"

export function mockUser(
    permissions: string[] = [],
    role: Role = "ADMIN"
): UserWithPermissions {
    return {
        id: "user-1",
        name: "Test User",
        email: "test@fare-asso.fr",
        image: null,
        createdAt: new Date("2026-01-01T00:00:00Z"),
        deletedAt: null,
        role,
        permissions: permissions.map((name, i) => ({
            id: i + 1,
            userId: "user-1",
            permissionId: i + 1,
            permission: {
                id: i + 1,
                title: name,
                name,
                category: "test",
                description: null
            }
        }))
    }
}
