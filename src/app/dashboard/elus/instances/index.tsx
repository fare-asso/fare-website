import { Await, createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import InstanceList from "@/components/dashboard/elus/instanceList"
import type { InstanceWithLogo } from "@/components/dashboard/elus/sortableInstanceList"
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
import { createClient } from "@/helpers/supabase/server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getInstancesPerms = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw redirect({ href: "/login" })
    }
    if (!hasPermission(user, "access:instances")) {
        throw redirect({ href: "/dashboard/unauthorized" })
    }
    return {
        canCreate: hasPermission(user, "create:instance"),
        canEdit: hasPermission(user, "edit:instance"),
        canDelete: hasPermission(user, "delete:instance")
    }
})

const getInstances = createServerFn().handler(
    async (): Promise<InstanceWithLogo[] | null> => {
        const user = await getCurrentUserWithPermissions()
        if (!user || !hasPermission(user, "access:instances")) {
            return null
        }

        const supabase = createClient()
        const instances = await tryCatch(
            prisma.instance.findMany({
                include: { _count: { select: { conseils: true } } },
                orderBy: { order: "asc" }
            })
        )
        if (!instances.success) {
            return null
        }

        return instances.value.map((instance) => ({
            instance,
            logoUrls: instance.logoPaths.map(
                (path) =>
                    supabase.storage
                        .from("instance-pictures")
                        .getPublicUrl(path).data.publicUrl
            )
        }))
    }
)

export const Route = createFileRoute("/dashboard/elus/instances/")({
    loader: async () => ({
        perms: await getInstancesPerms(),
        instances: getInstances()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Instances") }] }),
    component: Instances
})

function Instances() {
    const { perms, instances } = Route.useLoaderData()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Instances</CardTitle>
                <CardDescription>
                    Espace de gestion des instances de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Await promise={instances} fallback={<p>Chargement...</p>}>
                    {(value) => (
                        <InstanceList
                            instances={value}
                            canCreate={perms.canCreate}
                            canEdit={perms.canEdit}
                            canDelete={perms.canDelete}
                        />
                    )}
                </Await>
            </CardContent>
        </Card>
    )
}
