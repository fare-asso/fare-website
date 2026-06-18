import CalendarFeed from "@/components/dashboard/bagadAsso/calendarFeed"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

import ActiveTickets from "./activeTickets"
import ArchivedTickets from "./archivedTickets"
import PastTickets from "./pastTickets"
import TabSwitcher from "./tabSwitcher"

export default async function Tickets() {
    const user = await getCurrentUserWithPermissions()
    const canManage = user ? hasPermission(user, "access:bagad-asso") : false

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex flex-row justify-between p-0">
                <div className="space-y-2">
                    <CardTitle>Espace Bagad'Asso — Tickets</CardTitle>
                    <CardDescription>
                        Gestion des tickets du projet Bagad'Asso
                    </CardDescription>
                </div>
                {canManage ? (
                    <CalendarFeed token={user?.calendarToken ?? null} />
                ) : null}
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <ActiveTickets />
                    <PastTickets />
                    <ArchivedTickets />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}
