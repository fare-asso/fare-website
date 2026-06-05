import type { Metadata } from "next"
import { Suspense } from "react"

import BulkImportElusButton from "@/components/dashboard/elus/bulkImportElusButton"
import EluList from "@/components/dashboard/elus/eluList"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Élu·e·s"
}

export default async function Elues(): Promise<React.JSX.Element> {
    const user = await getCurrentUserWithPermissions()

    const canCreateElu = !!user && hasPermission(user, "create:elu")
    const canEditElu = !!user && hasPermission(user, "edit:elu")
    const canDeleteElu = !!user && hasPermission(user, "delete:elu")
    const canCreateConseil = !!user && hasPermission(user, "create:instance")
    const canEditConseil = !!user && hasPermission(user, "edit:instance")
    const canDeleteConseil = !!user && hasPermission(user, "delete:instance")

    const tree = await tryCatch(
        prisma.instance.findMany({
            include: {
                conseils: {
                    orderBy: { order: "asc" },
                    include: {
                        elus: {
                            where: { deletedAt: null },
                            orderBy: { order: "asc" }
                        }
                    }
                }
            },
            orderBy: { order: "asc" }
        })
    )
    const instances = tree.success ? tree.value : []

    const instanceOptions = instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        conseils: instance.conseils.map((conseil) => ({
            id: conseil.id,
            name: conseil.name
        }))
    }))

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex justify-between p-0">
                <div>
                    <CardTitle>Élu·e·s</CardTitle>
                    <CardDescription>
                        Espace de gestion des élu·e·s de la Fédération
                    </CardDescription>
                </div>
                <BulkImportElusButton instances={instanceOptions} />
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargement...</p>}>
                    <EluList
                        instances={instances}
                        instanceOptions={instanceOptions}
                        canCreateElu={canCreateElu}
                        canEditElu={canEditElu}
                        canDeleteElu={canDeleteElu}
                        canCreateConseil={canCreateConseil}
                        canEditConseil={canEditConseil}
                        canDeleteConseil={canDeleteConseil}
                    />
                </Suspense>
            </CardContent>
        </Card>
    )
}
