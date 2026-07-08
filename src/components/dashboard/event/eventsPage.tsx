import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { EventWithImage } from "@/actions/events/listEventsAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import CreateEventButton from "./createEventButton"
import { DataTable } from "./data-table"

interface EventsPageProps {
    user: ShellUser
    pathname: string
    initialData: EventWithImage[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function EventsContent({
    initialData,
    canCreate,
    canEdit,
    canDelete
}: Omit<EventsPageProps, "user" | "pathname">) {
    const { data: events } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const { data, error } = await actions.events.listEventsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des évènements.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Evènements</CardTitle>
                <CardDescription>
                    Espace de gestion des évènements de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <DataTable
                    data={events}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <CreateEventButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function EventsPage({
    user,
    pathname,
    ...rest
}: EventsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <EventsContent {...rest} />
        </DashboardShell>
    )
}
