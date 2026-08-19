import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import { DashboardShells } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { Adhesion } from "@/generated/prisma/client"

import ActiveAdhesions from "./activeAdhesions"
import AdhesionSummary from "./adhesionSummary"
import ArchivedAdhesions from "./archivedAdhesions"
import AdhesionTabSwitcher from "./tabSwitcher"

interface AdhesionsPageProps {
    initialData: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

function AdhesionsContent({
    initialData,
    canEdit,
    canDownload
}: Omit<AdhesionsPageProps, "user" | "pathname">) {
    const { data } = useQuery({
        queryKey: ["adhesions"],
        queryFn: async () => {
            const { data, error } = await actions.adhesion.listAdhesionsAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des adhésions.")
            }
            return data.value
        },
        initialData
    })

    const active = data.filter((a) => a.archived === null)
    const archived = data.filter((a) => a.archived !== null)

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Demandes d'adhésion</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes d'adhésion à la FARE
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-0">
                <AdhesionSummary adhesions={data} />
                <AdhesionTabSwitcher>
                    <ActiveAdhesions
                        data={active}
                        canEdit={canEdit}
                        canDownload={canDownload}
                    />
                    <ArchivedAdhesions
                        data={archived}
                        canEdit={canEdit}
                        canDownload={canDownload}
                    />
                </AdhesionTabSwitcher>
            </CardContent>
        </Card>
    )
}

export default function AdhesionsPage(rest: AdhesionsPageProps) {
    return (
        <DashboardShells>
            <AdhesionsContent {...rest} />
        </DashboardShells>
    )
}
