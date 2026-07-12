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
import type { BagadAssoSuggestion } from "@/generated/prisma/client"

import ActiveSuggestions from "./suggestions/activeSuggestions"
import ArchivedSuggestions from "./suggestions/archivedSuggestions"
import TabSwitcher from "./suggestions/tabSwitcher"

interface SuggestionsPageProps {
    user: ShellUser
    pathname: string
    initialSuggestions: BagadAssoSuggestion[]
}

function SuggestionsContent({
    initialSuggestions
}: Pick<SuggestionsPageProps, "initialSuggestions">) {
    const { data: suggestions } = useQuery({
        queryKey: ["bagadSuggestions"],
        queryFn: async () => {
            const { data, error } =
                await actions.bagadAsso.listSuggestionsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des suggestions.")
            }
            return data.value
        },
        initialData: initialSuggestions
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>
                    Espace Bagad'Asso — Suggestions de matériel
                </CardTitle>
                <CardDescription>
                    Suggestions de matériel envoyées par les associations du
                    réseau
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <TabSwitcher>
                    <ActiveSuggestions suggestions={suggestions} />
                    <ArchivedSuggestions suggestions={suggestions} />
                </TabSwitcher>
            </CardContent>
        </Card>
    )
}

export default function SuggestionsPage({
    user,
    pathname,
    ...rest
}: SuggestionsPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <SuggestionsContent {...rest} />
        </DashboardShell>
    )
}
