import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ActiveQuestions from "@/components/dashboard/bougeTaPrison/questions/activeQuestions"
import ArchivedQuestions from "@/components/dashboard/bougeTaPrison/questions/archivedQuestions"
import TabSwitcher from "@/components/dashboard/bougeTaPrison/questions/tabSwitcher"
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

const getQuestions = createServerFn().handler(async () => {
    const result = await tryCatch(
        Promise.all([
            prisma.bTPTutorQuestion.findMany({
                where: { archived: null },
                orderBy: { createdAt: "desc" }
            }),
            prisma.bTPTutorQuestion.findMany({
                where: { archived: { not: null } },
                orderBy: { createdAt: "desc" }
            })
        ])
    )
    if (!result.success) {
        captureActionError(result.error)
        return null
    }
    const [active, archived] = result.value
    return { active, archived }
})

export const Route = createFileRoute("/dashboard/bouge-ta-prison/questions/")({
    validateSearch: (s: Record<string, unknown>) => ({
        tab: typeof s.tab === "string" ? s.tab : "active"
    }),
    loader: async () => ({ data: await getQuestions() }),
    head: () => ({
        meta: [{ title: dashboardTitle("Bouge Ta Prison — Questions") }]
    }),
    component: QuestionsPage
})

function QuestionsPage() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <div>Erreur lors de la récupération des questions</div>
    }

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bouge Ta Prison — Questions</CardTitle>
                <CardDescription>
                    Gestion des questions du projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <ActiveQuestions questions={data.active} />
                    <ArchivedQuestions questions={data.archived} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}
