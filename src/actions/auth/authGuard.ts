import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import type { Role } from "@/generated/prisma/client"
import { createAdminClient, createClient } from "@/helpers/supabase/server"

const permissionProtectedRoutes: {
    pathIncludes: string
    requiredPermission: string
}[] = [
    {
        pathIncludes: "/dashboard/users",
        requiredPermission: "access:users"
    },
    {
        pathIncludes: "/dashboard/bouge-ta-prison",
        requiredPermission: "access:btp"
    },
    {
        pathIncludes: "/dashboard/bagadAsso",
        requiredPermission: "access:bagad-asso"
    },
    {
        pathIncludes: "/dashboard/adhesions",
        requiredPermission: "access:adhesions"
    }
    // add more routes and permissions as needed
]

export const dashboardGuard = createServerFn({ method: "GET" })
    .inputValidator((data: { pathname: string }) => data)
    .handler(async ({ data }) => {
        const supabase = createClient()
        const userResult = await supabase.auth.getUser()

        /* Not authenticated */
        if (userResult.error || !userResult.data.user) {
            throw redirect({ href: "/login" })
        }

        /* Authenticated */

        // Service-role client bypasses RLS / PostgREST grants. The user is
        // already authenticated above; this only reads their own row.
        const adminSupabase = createAdminClient()

        const userObject = await adminSupabase
            .from("User")
            .select("role, deletedAt")
            .eq("id", userResult.data.user.id)
            .single()

        if (userObject.error || !userObject.data) {
            console.error(
                "Supabase error:",
                userObject.error?.message || "User not found"
            )
            throw redirect({ href: "/" })
        }

        // Block soft-deleted users
        if (userObject.data.deletedAt !== null) {
            await supabase.auth.signOut()
            throw redirect({ href: "/login?error=account_deleted" })
        }

        const role: Role = userObject.data.role

        const allowedRolesInDashboard: Role[] = ["MEMBER", "ADMIN"]
        if (!allowedRolesInDashboard.includes(role)) {
            throw redirect({ href: "/login" })
        }

        // Check permissions for protected routes
        const matchedRoute = permissionProtectedRoutes.find((route) =>
            data.pathname.includes(route.pathIncludes)
        )

        if (matchedRoute) {
            const permissionResult = await adminSupabase
                .from("UserPermission")
                .select("*, Permission( name )")
                .eq("userId", userResult.data.user.id)

            const allowed = permissionResult.data?.some(
                (entry) =>
                    entry.Permission?.name === matchedRoute.requiredPermission
            )

            if (!allowed) {
                throw redirect({ href: "/dashboard/unauthorized" })
            }
        }

        return { userId: userResult.data.user.id, role }
    })
