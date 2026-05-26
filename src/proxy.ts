import { type NextRequest, NextResponse } from "next/server"

import type { Role } from "@/generated/prisma/client"
import { updateSession } from "@/helpers/supabase/middleware"

import { createAdminClient, createClient } from "./helpers/supabase/server"

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

export async function proxy(request: NextRequest) {
    const supabase = await createClient()
    const response = await updateSession(request)
    const { data, error } = await supabase.auth.getUser()

    /* Not authenticated */
    if (error || !data.user) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    /* Authenticated */

    // Service-role client bypasses RLS / PostgREST grants. The user is
    // already authenticated above; this only reads their own row.
    const adminSupabase = createAdminClient()

    const userObject = await adminSupabase
        .from("User")
        .select("role, deletedAt")
        .eq("id", data.user.id)
        .single()

    if (userObject.error || !userObject.data) {
        console.error(userObject.error?.message || "User not found")
        return NextResponse.redirect(new URL("/", request.url))
    }

    // Block soft-deleted users
    if (userObject.data.deletedAt !== null) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
            new URL("/login?error=account_deleted", request.url)
        )
    }

    const role: Role = userObject.data.role

    if (request.url.includes("/dashboard")) {
        const allowedRolesInDashboard: Role[] = ["MEMBER", "ADMIN"]
        if (!allowedRolesInDashboard.includes(role)) {
            return NextResponse.redirect(new URL("/espace-asso", request.url))
        }
    }

    if (request.url.includes("/espace-asso")) {
        const allowedRolesInEspaceAsso: Role[] = ["ASSO_OWNER"]
        if (!allowedRolesInEspaceAsso.includes(role)) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    // Check permissions for protected routes
    const matchedRoute = permissionProtectedRoutes.find((route) =>
        request.nextUrl.pathname.includes(route.pathIncludes)
    )

    if (matchedRoute) {
        const permissionResult = await adminSupabase
            .from("UserPermission")
            .select("*, Permission( name )")
            .eq("userId", data.user.id)

        const hasPermission = permissionResult.data?.some(
            (entry) =>
                entry.Permission?.name === matchedRoute.requiredPermission
        )

        if (!hasPermission) {
            return NextResponse.redirect(
                new URL("/dashboard/unauthorized", request.url)
            )
        }
    }

    return response
}

export const config = {
    matcher: ["/dashboard/:path*", "/espace-asso/:path*"]
}
