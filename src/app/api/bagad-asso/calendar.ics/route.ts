import { buildBagadAssoCalendar } from "@/helpers/bagadAssoCalendar"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createError, useLogger, withEvlog } from "@/lib/evlog"
import { tryCatch } from "@/lib/utils"

export const GET = withEvlog(async (request: Request) => {
    const log = useLogger()
    const token = new URL(request.url).searchParams.get("token")?.trim()

    if (!token) {
        throw createError({
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
        throw createError({
            status: 500,
            message: "Internal Server Error",
            why: "Impossible de vérifier le jeton calendrier",
            fix: "Réessayer plus tard",
            cause: user.error
        })
    }

    if (!user.value) {
        throw createError({
            status: 401,
            message: "Unauthorized",
            why: "Jeton invalide ou révoqué",
            fix: "Régénérer un lien calendrier depuis le tableau de bord"
        })
    }

    if (!hasPermission(user.value, "access:bagad-asso")) {
        throw createError({
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
        throw createError({
            status: 500,
            message: "Internal Server Error",
            why: "Impossible de récupérer les tickets Bagad'Asso",
            fix: "Réessayer plus tard",
            cause: tickets.error
        })
    }

    log.set({ resultCount: tickets.value.length })

    return new Response(buildBagadAssoCalendar(tickets.value), {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'inline; filename="bagad-asso.ics"',
            "Cache-Control": "private, max-age=3600"
        }
    })
})
