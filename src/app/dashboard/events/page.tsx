import type { Metadata } from "next"
import { Suspense } from "react"
import CreateEventButton from "@/components/dashboard/event/createEventButton"
import EventDataTable from "@/components/dashboard/event/eventDataTable"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export const metadata: Metadata = {
    title: "Évènements"
}

export default async function EventsPage() {
    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:event")
    const canEdit = !!user && hasPermission(user, "edit:event")
    const canDelete = !!user && hasPermission(user, "delete:event")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Evènements</CardTitle>
                <CardDescription>
                    Espace de gestion des évènements de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <EventDataTable canEdit={canEdit} canDelete={canDelete} />
                </Suspense>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <CreateEventButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
