import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import AddAssociationButton from "@/components/dashboard/associations/addAssociationButton"
import AssociationList from "@/components/dashboard/associations/associationList"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getAssociationPermissions = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canCreate: !!user && hasPermission(user, "create:association"),
        canEdit: !!user && hasPermission(user, "edit:association"),
        canDelete: !!user && hasPermission(user, "delete:association"),
        canInvite: !!user && hasPermission(user, "invite:representative"),
        canApprove: !!user && hasPermission(user, "approve:association")
    }
})

const getAssociations = createServerFn().handler(async () => {
    const supabase = createClient()

    const result = await tryCatch(
        prisma.association.findMany({
            orderBy: { name: "asc" },
            include: { representative: true }
        })
    )
    if (!result.success) return null

    return result.value
        .sort((a, b) => {
            // Pending (approved === null) first, then alphabetical by name
            if (a.approved === null && b.approved !== null) return -1
            if (a.approved !== null && b.approved === null) return 1
            return 0
        })
        .map(({ representative, ...asso }) => ({
            ...asso,
            logoUrl: supabase.storage
                .from("association-pictures")
                .getPublicUrl(asso.logoPath).data.publicUrl,
            hasRepresentative: !!representative
        }))
})

export const Route = createFileRoute("/dashboard/associations/")({
    loader: async () => ({
        permissions: await getAssociationPermissions(),
        associations: getAssociations()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Associations") }] }),
    component: Associations
})

function Associations() {
    const { permissions, associations } = Route.useLoaderData()
    const { canCreate, canEdit, canDelete, canInvite, canApprove } = permissions

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Associations</CardTitle>
                <CardDescription>
                    Espace de gestion du réseau de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Await promise={associations} fallback={<p>Chargements...</p>}>
                    {(assos) => (
                        <AssociationList
                            assos={assos}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canInvite={canInvite}
                            canApprove={canApprove}
                        />
                    )}
                </Await>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddAssociationButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
