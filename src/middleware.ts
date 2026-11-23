import type { APIContext, MiddlewareNext } from "astro"
import { defineMiddleware } from "astro:middleware"
import { createRequestLogger, initLogger, toLoggerConfig } from "evlog"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase/astro"
import { tryCatch } from "@/lib/utils"

import config from "../evlog.config.ts"
import type { Permission } from "../prisma/seed.ts"

initLogger(toLoggerConfig(config))

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
    },
    {
        pathIncludes: "/dashboard/remboursements",
        requiredPermission: "access:remboursements"
    }
]

async function handleRequest(
    context: APIContext,
    next: MiddlewareNext
): Promise<Response> {
    if (!context.url.pathname.startsWith("/dashboard")) {
        context.locals.user = null
        return next()
    }

    const supabase = createClient(context)
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
        return context.redirect("/login")
    }

    const user = await prisma.user.findFirst({
        where: { id: data.user.id },
        include: { permissions: { include: { permission: true } } }
    })

    if (!user) {
        return context.redirect("/")
    }

    if (user.deletedAt !== null) {
        await supabase.auth.signOut()
        return context.redirect("/login?error=account_deleted")
    }

    if (user.role !== "ADMIN") {
        return context.redirect("/")
    }

    const matchedRoute = permissionProtectedRoutes.find((route) =>
        context.url.pathname.includes(route.pathIncludes)
    )

    if (
        matchedRoute &&
        !hasPermission(user, matchedRoute.requiredPermission as Permission)
    ) {
        return context.redirect("/dashboard/unauthorized")
    }

    context.locals.user = user
    return next()
}

export const onRequest = defineMiddleware(async (context, next) => {
    const log = createRequestLogger({
        method: context.request.method,
        path: context.url.pathname
    })

    context.locals.log = log

    const response = await tryCatch(handleRequest(context, next))
    if (!response.success) {
        log.error(
            response.error instanceof Error
                ? response.error
                : new Error(String(response.error))
        )
        log.emit()
        throw response.error
    }

    log.emit({ status: response.value.status })
    return response.value
})
