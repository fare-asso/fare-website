import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import type { BagadAssoTicket } from "@/generated/prisma/client"
import { ServerSearchContext } from "@/hooks/useSearchParam"

import Calendar from "./calendar"

interface CalendarPageProps {
    initialTickets: BagadAssoTicket[]
    initialSearch: string
}

function CalendarContent({
    initialTickets
}: {
    initialTickets: BagadAssoTicket[]
}) {
    const { data: tickets } = useQuery({
        queryKey: ["bagadCalendar"],
        queryFn: async () => {
            const { data, error } = await actions.bagadAsso.listCalendarAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement du calendrier.")
            }
            return data.value
        },
        initialData: initialTickets
    })

    const now = new Date()
    // most recent 1st September (start of the academic year)
    const academicYearStart = new Date(
        now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1,
        8,
        1
    )
    const active = tickets.filter((t) => !t.deleted)
    const currentYear = tickets.filter(
        (t) => new Date(t.eventDate) >= academicYearStart
    )
    const upcoming = active.filter((t) => new Date(t.eventDate) >= now)
    const stats = [
        {
            label: "Événements depuis septembre",
            value: currentYear.length
        },
        { label: "Événements à venir", value: upcoming.length },
        {
            label: "Étudiants atteints depuis septembre",
            value: currentYear.reduce(
                (sum, t) => sum + t.estimatedParticipants,
                0
            )
        }
    ]

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardContent className="h-1/2 flex-1 p-0">
                <section className="mb-6 grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} variant="flat" className="gap-1">
                            <CardDescription>{stat.label}</CardDescription>
                            <p className="text-3xl font-bold">{stat.value}</p>
                        </Card>
                    ))}
                </section>
                <Calendar events={tickets} />
            </CardContent>
        </Card>
    )
}

export default function CalendarPage({
    initialTickets,
    initialSearch
}: CalendarPageProps) {
    return (
        <ServerSearchContext.Provider value={initialSearch}>
            <DashboardShell>
                <CalendarContent initialTickets={initialTickets} />
            </DashboardShell>
        </ServerSearchContext.Provider>
    )
}
