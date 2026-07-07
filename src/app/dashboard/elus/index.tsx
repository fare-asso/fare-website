import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

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
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getElusPageData = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw redirect({ href: "/login" })
    }
    if (!hasPermission(user, "access:elus")) {
        throw redirect({ href: "/dashboard/unauthorized" })
    }

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

    return {
        instances: tree.success ? tree.value : [],
        canCreateElu: hasPermission(user, "create:elu"),
        canEditElu: hasPermission(user, "edit:elu"),
        canDeleteElu: hasPermission(user, "delete:elu"),
        canCreateConseil: hasPermission(user, "create:instance"),
        canEditConseil: hasPermission(user, "edit:instance"),
        canDeleteConseil: hasPermission(user, "delete:instance")
    }
})

export const Route = createFileRoute("/dashboard/elus/")({
    loader: async () => await getElusPageData(),
    head: () => ({ meta: [{ title: dashboardTitle("Élu·e·s") }] }),
    component: Elues
})

function Elues() {
    const {
        instances,
        canCreateElu,
        canEditElu,
        canDeleteElu,
        canCreateConseil,
        canEditConseil,
        canDeleteConseil
    } = Route.useLoaderData()

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
            </CardContent>
        </Card>
    )
}
