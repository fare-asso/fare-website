import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { ArchiveIcon, InboxIcon, ReceiptTextIcon } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Remboursement } from "@/generated/prisma/client"
import { useSearchParam } from "@/hooks/useSearchParam"

import RemboursementCard from "./remboursementCard"

interface RemboursementsPageProps {
    initialData: Remboursement[]
    canEdit: boolean
    canDownload: boolean
    thirtyDaysAgo: Date
}

function RemboursementList({
    items,
    canEdit,
    canDownload
}: {
    items: Remboursement[]
    canEdit: boolean
    canDownload: boolean
}) {
    if (items.length === 0) {
        return (
            <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                <ReceiptTextIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                <p className="text-muted-foreground font-medium">
                    Aucune demande de remboursement
                </p>
                <p className="text-muted-foreground/70 mt-1 text-sm">
                    Les demandes de remboursement apparaîtront ici
                </p>
            </div>
        )
    }

    return (
        <div className="@container flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 @min-2xl:grid-cols-2">
                    {items.map((item) => (
                        <RemboursementCard
                            key={item.id}
                            remboursement={item}
                            canEdit={canEdit}
                            canDownload={canDownload}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function RemboursementsContent({
    initialData,
    canEdit,
    canDownload,
    thirtyDaysAgo
}: RemboursementsPageProps) {
    const [tab, setTab] = useSearchParam("tab", "active")

    const { data } = useQuery({
        queryKey: ["remboursements"],
        queryFn: async () => {
            const { data, error } =
                await actions.remboursement.listRemboursementsAction()
            if (error || !data.success) {
                throw new Error(
                    "Échec du chargement des demandes de remboursement."
                )
            }
            return data.value
        },
        initialData
    })

    const active = data.filter((r) => r.archived === null)
    const archived = data.filter((r) => r.archived !== null)
    const recentCount = active.filter(
        (r) => new Date(r.createdAt) >= thirtyDaysAgo
    ).length

    const stats = [
        {
            label: "Total demandes",
            value: data.length,
            icon: ReceiptTextIcon,
            description: "Toutes les demandes"
        },
        {
            label: "En attente",
            value: active.length,
            icon: InboxIcon,
            description: `dont ${recentCount} ce mois-ci`,
            alwaysShow: true
        },
        {
            label: "Archivées",
            value: archived.length,
            icon: ArchiveIcon,
            description: "Demandes traitées"
        }
    ]

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Demandes de remboursement</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes de remboursement de la
                    Trésorerie
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className={
                                stat.alwaysShow ? "block" : "hidden sm:block"
                            }
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.label}
                                </CardTitle>
                                <stat.icon className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stat.value}
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Tabs
                    value={tab}
                    onValueChange={setTab}
                    className="flex h-full w-full flex-col items-center gap-2"
                >
                    <TabsList className="grid w-full grid-cols-2 md:w-1/2">
                        <TabsTrigger value="active">Actives</TabsTrigger>
                        <TabsTrigger value="archived">Archivées</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active" className="h-0 w-full">
                        <div>
                            <p className="my-4 text-sm text-gray-500">
                                <span className="font-bold">
                                    {active.length} demande
                                    {active.length > 1 ? "s" : ""}
                                </span>{" "}
                                de remboursement en attente de traitement.
                            </p>
                            <RemboursementList
                                items={active}
                                canEdit={canEdit}
                                canDownload={canDownload}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="archived" className="h-0 w-full">
                        <div>
                            <p className="my-4 text-sm text-gray-500">
                                <span className="font-bold">
                                    {archived.length} demande
                                    {archived.length > 1 ? "s" : ""}
                                </span>{" "}
                                de remboursement archivée
                                {archived.length > 1 ? "s" : ""}.
                            </p>
                            <RemboursementList
                                items={archived}
                                canEdit={canEdit}
                                canDownload={canDownload}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default function RemboursementsPage(props: RemboursementsPageProps) {
    return (
        <DashboardShell>
            <RemboursementsContent {...props} />
        </DashboardShell>
    )
}
