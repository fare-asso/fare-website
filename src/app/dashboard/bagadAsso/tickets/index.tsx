import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import CalendarFeed from "@/components/dashboard/bagadAsso/calendarFeed"
import ActiveTickets from "@/components/dashboard/bagadAsso/tickets/activeTickets"
import ArchivedTickets from "@/components/dashboard/bagadAsso/tickets/archivedTickets"
import PastTickets from "@/components/dashboard/bagadAsso/tickets/pastTickets"
import TabSwitcher from "@/components/dashboard/bagadAsso/tickets/tabSwitcher"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

const getTicketsPageData = createServerFn().handler(async () => {
    const now = new Date()
    const result = await tryCatch(
        Promise.all([
            getCurrentUserWithPermissions(),
            prisma.bagadAssoTicket.findMany({
                where: { deleted: null, eventDate: { gte: now } },
                orderBy: { eventDate: "asc" }
            }),
            prisma.bagadAssoTicket.findMany({
                where: { deleted: null, eventDate: { lt: now } },
                orderBy: { eventDate: "desc" }
            }),
            prisma.bagadAssoTicket.findMany({
                where: { deleted: { not: null } },
                orderBy: { eventDate: "desc" }
            })
        ])
    )
    if (!result.success) {
        captureActionError(result.error)
        return null
    }
    const [user, active, past, archived] = result.value
    return {
        canManage: user ? hasPermission(user, "access:bagad-asso") : false,
        calendarToken: user?.calendarToken ?? null,
        active,
        past,
        archived
    }
})

export const Route = createFileRoute("/dashboard/bagadAsso/tickets/")({
    validateSearch: (s: Record<string, unknown>) => ({
        tab: typeof s.tab === "string" ? s.tab : "active"
    }),
    loader: async () => ({ data: await getTicketsPageData() }),
    component: Tickets
})

function Tickets() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <div>Erreur lors de la récupération des tickets</div>
    }

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex flex-row justify-between p-0">
                <div className="space-y-2">
                    <CardTitle>Espace Bagad'Asso — Tickets</CardTitle>
                    <CardDescription>
                        Gestion des tickets du projet Bagad'Asso
                    </CardDescription>
                </div>
                {data.canManage ? (
                    <CalendarFeed token={data.calendarToken} />
                ) : null}
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <ActiveTickets tickets={data.active} />
                    <PastTickets tickets={data.past} />
                    <ArchivedTickets tickets={data.archived} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}
