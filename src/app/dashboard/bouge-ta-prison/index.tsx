import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ApprovedApplications from "@/components/dashboard/bougeTaPrison/approvedApplications"
import ArchivedApplications from "@/components/dashboard/bougeTaPrison/archivedApplications"
import PendingApplications from "@/components/dashboard/bougeTaPrison/pendingApplications"
import TabSwitcher from "@/components/dashboard/bougeTaPrison/tabSwitcher"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { captureActionError } from "@/lib/sentry.server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getApplications = createServerFn().handler(async () => {
    const result = await tryCatch(
        Promise.all([
            prisma.bTPTutorApplication.findMany({
                where: { archived: null, approved: false },
                orderBy: { createdAt: "desc" }
            }),
            prisma.bTPTutorApplication.findMany({
                where: { archived: null, approved: true },
                orderBy: { createdAt: "desc" }
            }),
            prisma.bTPTutorApplication.findMany({
                where: { archived: { not: null } },
                orderBy: { createdAt: "desc" }
            })
        ])
    )
    if (!result.success) {
        captureActionError(result.error)
        return null
    }
    const [pending, approved, archived] = result.value
    return { pending, approved, archived }
})

export const Route = createFileRoute("/dashboard/bouge-ta-prison/")({
    validateSearch: (s: Record<string, unknown>) => ({
        tab: typeof s.tab === "string" ? s.tab : "pending"
    }),
    loader: async () => ({ data: await getApplications() }),
    head: () => ({ meta: [{ title: dashboardTitle("Bouge Ta Prison") }] }),
    component: EspaceBougeTaPrison
})

function EspaceBougeTaPrison() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <div>Erreur lors de la récupération des candidatures</div>
    }

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
                    <PendingApplications applications={data.pending} />
                    <ApprovedApplications applications={data.approved} />
                    <ArchivedApplications applications={data.archived} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}
