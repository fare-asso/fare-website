import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { BTPTutorQuestion } from "@/generated/prisma/client"

import ActiveQuestions from "./activeQuestions"
import ArchivedQuestions from "./archivedQuestions"
import QuestionsTabSwitcher from "./questionsTabSwitcher"

interface QuestionsPageProps {
    initialData: BTPTutorQuestion[]
}

function QuestionsContent({ initialData }: QuestionsPageProps) {
    const { data } = useQuery({
        queryKey: ["tutorQuestions"],
        queryFn: async () => {
            const { data, error } =
                await actions.bougeTaPrison.listTutorQuestionsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des questions.")
            }
            return data.value
        },
        initialData
    })

    const active = data.filter((q) => !q.archived)
    const archived = data.filter((q) => q.archived)

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Espace Bouge Ta Prison — Questions</CardTitle>
                <CardDescription>
                    Gestion des questions du projet Bouge Ta Prison
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <QuestionsTabSwitcher>
                    <ActiveQuestions data={active} />
                    <ArchivedQuestions data={archived} />
                </QuestionsTabSwitcher>
            </CardContent>
        </Card>
    )
}

export default function QuestionsPage({ ...rest }: QuestionsPageProps) {
    return (
        <DashboardShell>
            <QuestionsContent {...rest} />
        </DashboardShell>
    )
}
