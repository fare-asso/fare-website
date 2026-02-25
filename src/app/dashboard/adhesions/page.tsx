import type { Metadata } from "next"
import { Suspense } from "react"
import AdhesionSummary from "@/components/dashboard/adhesions/adhesionSummary"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import ActiveAdhesions from "./activeAdhesions"
import ArchivedAdhesions from "./archivedAdhesions"
import AdhesionTabSwitcher from "./tabSwitcher"

export const metadata: Metadata = {
    title: "Adhésions"
}

export const dynamic = "force-dynamic"

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

export default async function Adhesions() {
    const user = await getCurrentUserWithPermissions()
    const canEdit = !!user && hasPermission(user, "edit:adhesion")
    const canDownload =
        !!user && hasPermission(user, "download:adhesion-folder")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Demandes d'adhésion</CardTitle>
                <CardDescription>
                    Espace de gestion des demandes d'adhésion à la FARE
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-0">
                <Suspense fallback={<SummarySkeleton />}>
                    <AdhesionSummary />
                </Suspense>
                <AdhesionTabSwitcher>
                    <Suspense fallback={<p>Chargement...</p>}>
                        <ActiveAdhesions
                            canEdit={canEdit}
                            canDownload={canDownload}
                        />
                    </Suspense>
                    <Suspense fallback={<p>Chargement...</p>}>
                        <ArchivedAdhesions
                            canEdit={canEdit}
                            canDownload={canDownload}
                        />
                    </Suspense>
                </AdhesionTabSwitcher>
            </CardContent>
        </Card>
    )
}
