import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ActiveAdhesions from "@/components/dashboard/adhesions/activeAdhesions"
import AdhesionSummary from "@/components/dashboard/adhesions/adhesionSummary"
import ArchivedAdhesions from "@/components/dashboard/adhesions/archivedAdhesions"
import AdhesionTabSwitcher from "@/components/dashboard/adhesions/tabSwitcher"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getAdhesionPermissions = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canEdit: !!user && hasPermission(user, "edit:adhesion"),
        canDownload: !!user && hasPermission(user, "download:adhesion-folder")
    }
})

const getAdhesionSummary = createServerFn().handler(async () => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const counts = await tryCatch(
        Promise.all([
            prisma.adhesion.count(),
            prisma.adhesion.count({
                where: { archived: null }
            }),
            prisma.adhesion.count({
                where: { archived: { not: null } }
            }),
            prisma.adhesion.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                    archived: null
                }
            })
        ])
    )
    if (!counts.success) return null
    const [total, activeCount, archivedCount, recentCount] = counts.value
    return { total, activeCount, archivedCount, recentCount }
})

const getActiveAdhesions = createServerFn().handler(async () => {
    const adhesions = await tryCatch(
        prisma.adhesion.findMany({
            where: { archived: null },
            orderBy: { createdAt: "desc" }
        })
    )
    return adhesions.success ? adhesions.value : null
})

const getArchivedAdhesions = createServerFn().handler(async () => {
    const adhesions = await tryCatch(
        prisma.adhesion.findMany({
            where: { archived: { not: null } },
            orderBy: { createdAt: "desc" }
        })
    )
    return adhesions.success ? adhesions.value : null
})

export const Route = createFileRoute("/dashboard/adhesions/")({
    validateSearch: (s: Record<string, unknown>) => ({
        tab: typeof s.tab === "string" ? s.tab : "active"
    }),
    loader: async () => ({
        permissions: await getAdhesionPermissions(),
        summary: getAdhesionSummary(),
        activeAdhesions: getActiveAdhesions(),
        archivedAdhesions: getArchivedAdhesions()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Adhésions") }] }),
    component: Adhesions
})

function SummarySkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="mt-1 h-3 w-32" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function Adhesions() {
    const { permissions, summary, activeAdhesions, archivedAdhesions } =
        Route.useLoaderData()
    const { canEdit, canDownload } = permissions

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Demandes d'adhésion</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes d'adhésion à la FARE
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-0">
                <Await promise={summary} fallback={<SummarySkeleton />}>
                    {(counts) =>
                        counts ? (
                            <AdhesionSummary {...counts} />
                        ) : (
                            <SummarySkeleton />
                        )
                    }
                </Await>
                <AdhesionTabSwitcher>
                    <Await
                        promise={activeAdhesions}
                        fallback={<p>Chargement...</p>}
                    >
                        {(adhesions) =>
                            adhesions ? (
                                <ActiveAdhesions
                                    adhesions={adhesions}
                                    canEdit={canEdit}
                                    canDownload={canDownload}
                                />
                            ) : (
                                <p>Echec du chargement des demandes</p>
                            )
                        }
                    </Await>
                    <Await
                        promise={archivedAdhesions}
                        fallback={<p>Chargement...</p>}
                    >
                        {(adhesions) =>
                            adhesions ? (
                                <ArchivedAdhesions
                                    adhesions={adhesions}
                                    canEdit={canEdit}
                                    canDownload={canDownload}
                                />
                            ) : (
                                <p>Echec du chargement des demandes</p>
                            )
                        }
                    </Await>
                </AdhesionTabSwitcher>
            </CardContent>
        </Card>
    )
}
