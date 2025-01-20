import { NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/helpers/supabase/middleware";

import { createClient } from "./helpers/supabase/server";

import { Role } from "@prisma/client";

export async function middleware(request: NextRequest) {
    const supabase = createClient();

    const response = await updateSession(request);

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        // not authenticated
        return NextResponse.redirect(new URL("/login", request.url));
    } else {
        // auth success

        // fetch current user role
        const roleObject = await supabase
            .from("User")
            .select("role")
            .eq("id", data.user.id);

        if (roleObject.error) {
            console.error(roleObject.error.message);
            return NextResponse.redirect(new URL("/", request.url));
        }

        const role: Role = roleObject.data[0].role;

        if (request.url.includes("/dashboard")) {
            const allowedRolesInDashboard: Role[] = ["MEMBER", "ADMIN"];
            if (allowedRolesInDashboard.includes(role)) {
                return response;
            } else {
                return NextResponse.redirect(
                    new URL("/espace-asso", request.url),
                );
            }
        }

        if (request.url.includes("/espace-asso")) {
            const allowedRolesInEspaceAsso: Role[] = ["ASSO_OWNER"];
            if (allowedRolesInEspaceAsso.includes(role)) {
                return response;
            } else {
                return NextResponse.redirect(
                    new URL("/dashboard", request.url),
                );
            }
        }

        return response;
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/espace-asso/:path*"],
};
