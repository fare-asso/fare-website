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
import type { BTPTutorApplication } from "@/generated/prisma/client"

import ApprovedApplications from "./approvedApplications"
import ArchivedApplications from "./archivedApplications"
import PendingApplications from "./pendingApplications"
import TabSwitcher from "./tabSwitcher"

interface CandidaturesPageProps {
    user: ShellUser
    pathname: string
    initialData: BTPTutorApplication[]
}

function CandidaturesContent({
    initialData
}: Omit<CandidaturesPageProps, "user" | "pathname">) {
    const { data } = useQuery({
        queryKey: ["tutorApplications"],
        queryFn: async () => {
            const { data, error } =
                await actions.bougeTaPrison.listTutorApplicationsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des candidatures.")
            }
            return data.value
        },
        initialData
    })

    const pending = data.filter((a) => !a.archived && !a.approved)
    const approved = data.filter((a) => !a.archived && a.approved)
    const archived = data.filter((a) => a.archived)

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bouge Ta Prison — Candidatures</CardTitle>
                <CardDescription>
                    Gestion des candidatures tutorat du projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 min-h-0 flex-1 p-0">
                <TabSwitcher>
                    <PendingApplications data={pending} />
                    <ApprovedApplications data={approved} />
                    <ArchivedApplications data={archived} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}

export default function CandidaturesPage({
    user,
    pathname,
    ...rest
}: CandidaturesPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <CandidaturesContent {...rest} />
        </DashboardShell>
    )
}
