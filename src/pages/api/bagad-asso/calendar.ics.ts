import type { APIRoute } from "astro"
import {
    createError,
    type ErrorOptions,
    parseError,
    type RequestLogger
} from "evlog"

import { buildBagadAssoCalendar } from "@/helpers/bagadAssoCalendar"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { tryCatch } from "@/lib/utils"

function errorResponse(log: RequestLogger, options: ErrorOptions): Response {
    const error = createError(options)
    log.error(error)
    const parsed = parseError(error)
    return Response.json(parsed, { status: parsed.status })
}

export const GET: APIRoute = async ({ request, locals }) => {
    const token = new URL(request.url).searchParams.get("token")?.trim()

    if (!token) {
        return errorResponse(locals.log, {
            status: 400,
            message: "Bad Request",
            why: "Le paramètre `token` est manquant",
            fix: "Fournir le jeton du lien calendrier"
        })
    }

    const user = await tryCatch(
        prisma.user.findFirst({
            where: { calendarToken: token, deletedAt: null },
            include: { permissions: { include: { permission: true } } }
        })
    )
    if (!user.success) {
        return errorResponse(locals.log, {
            status: 500,
            message: "Internal Server Error",
            why: "Impossible de vérifier le jeton calendrier",
            fix: "Réessayer plus tard",
            cause: user.error
        })
    }

    if (!user.value) {
        return errorResponse(locals.log, {
            status: 401,
            message: "Unauthorized",
            why: "Jeton invalide ou révoqué",
            fix: "Régénérer un lien calendrier depuis le tableau de bord"
        })
    }

    if (!hasPermission(user.value, "access:bagad-asso")) {
        return errorResponse(locals.log, {
            status: 403,
            message: "Forbidden",
            why: "Accès Bagad'Asso requis",
            fix: "Demander la permission access:bagad-asso"
        })
    }

    const tickets = await tryCatch(
        prisma.bagadAssoTicket.findMany({
            where: { deleted: null },
            orderBy: { eventDate: "asc" }
        })
    )
    if (!tickets.success) {
        return errorResponse(locals.log, {
            status: 500,
            message: "Internal Server Error",
            why: "Impossible de récupérer les tickets Bagad'Asso",
            fix: "Réessayer plus tard",
            cause: tickets.error
        })
    }

    locals.log.set({ resultCount: tickets.value.length })

    return new Response(buildBagadAssoCalendar(tickets.value), {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="bagad-asso.ics"',
            "Cache-Control": "private, max-age=3600"
        }
    })
}
