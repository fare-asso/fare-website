import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import ActiveTickets from "./activeTickets"
import ArchivedTickets from "./archivedTickets"
import PastTickets from "./pastTickets"
import TabSwitcher from "./tabSwitcher"

// oxlint-disable-next-line require-await -- Nextjs server component
export default async function Tickets() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bagad'Asso — Tickets</CardTitle>
                <CardDescription>
                    Gestion des tickets du projet Bagad'Asso
                </CardDescription>
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
