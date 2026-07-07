import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import CreateEventButton from "@/components/dashboard/event/createEventButton"
import { getData } from "@/components/dashboard/event/eventDataTable"
import { DataTable } from "@/components/dashboard/events/data-table"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { dashboardTitle } from "@/lib/seo"

const getEventsPageData = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canCreate: !!user && hasPermission(user, "create:event"),
        canEdit: !!user && hasPermission(user, "edit:event"),
        canDelete: !!user && hasPermission(user, "delete:event"),
        data: await getData()
    }
})

export const Route = createFileRoute("/dashboard/events/")({
    loader: async () => await getEventsPageData(),
    head: () => ({ meta: [{ title: dashboardTitle("Évènements") }] }),
    component: EventsPage
})

function EventsPage() {
    const { canCreate, canEdit, canDelete, data } = Route.useLoaderData()

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
                    data={data}
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
