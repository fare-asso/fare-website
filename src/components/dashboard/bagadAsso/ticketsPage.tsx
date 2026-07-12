import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { BagadAssoTicket } from "@/generated/prisma/client"

import CalendarFeed from "./calendarFeed"
import ActiveTickets from "./tickets/activeTickets"
import ArchivedTickets from "./tickets/archivedTickets"
import PastTickets from "./tickets/pastTickets"
import TabSwitcher from "./tickets/tabSwitcher"
import ValidatedTickets from "./tickets/validatedTickets"

interface TicketsPageProps {
    user: ShellUser
    pathname: string
    initialTickets: BagadAssoTicket[]
    canManage: boolean
    calendarToken: string | null
}

function TicketsContent({
    initialTickets,
    canManage,
    calendarToken
}: Omit<TicketsPageProps, "user" | "pathname">) {
    const { data: tickets } = useQuery({
        queryKey: ["bagadTickets"],
        queryFn: async () => {
            const { data, error } = await actions.bagadAsso.listTicketsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des tickets.")
            }
            return data.value
        },
        initialData: initialTickets
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex flex-row justify-between p-0">
                <div className="space-y-2">
                    <CardTitle>Espace Bagad'Asso — Tickets</CardTitle>
                    <CardDescription>
                        Gestion des tickets du projet Bagad'Asso
                    </CardDescription>
                </div>
                {canManage ? <CalendarFeed token={calendarToken} /> : null}
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <ActiveTickets tickets={tickets} />
                    <ValidatedTickets tickets={tickets} />
                    <PastTickets tickets={tickets} />
                    <ArchivedTickets tickets={tickets} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}

export default function TicketsPage({
    user,
    pathname,
    ...rest
}: TicketsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <TicketsContent {...rest} />
        </DashboardShell>
    )
}
