import type { Metadata } from "next"
import { Suspense } from "react"

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
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export const metadata: Metadata = {
    title: "Associations"
}

export default async function Associations() {
    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:association")
    const canEdit = !!user && hasPermission(user, "edit:association")
    const canDelete = !!user && hasPermission(user, "delete:association")
    const canInvite = !!user && hasPermission(user, "invite:representative")
    const canApprove = !!user && hasPermission(user, "approve:association")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Associations</CardTitle>
                <CardDescription>
                    Espace de gestion du réseau de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <AssociationList
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canInvite={canInvite}
                        canApprove={canApprove}
                    />
                </Suspense>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddAssociationButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
