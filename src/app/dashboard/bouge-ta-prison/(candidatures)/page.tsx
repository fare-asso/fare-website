import type { Metadata } from "next"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import ApprovedApplications from "./approvedApplications"
import ArchivedApplications from "./archivedApplications"
import PendingApplications from "./pendingApplications"
import TabSwitcher from "./tabSwitcher"

export const metadata: Metadata = {
    title: "Bouge Ta Prison"
}

export default function EspaceBougeTaPrison() {
    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bouge Ta Prison — Candidatures</CardTitle>
                <CardDescription>
                    Gestion des candidatures tutorat du projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <PendingApplications />
                    <ApprovedApplications />
                    <ArchivedApplications />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}
