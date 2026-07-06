import type { Metadata } from "next"
import { Suspense } from "react"

import AddPartenaireButton from "@/components/dashboard/partenaires/addPartenaireButton"
import PartenaireList from "@/components/dashboard/partenaires/partenaireList"
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
    title: "Partenaires"
}

export default async function Partenaires() {
    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:partner")
    const canEdit = !!user && hasPermission(user, "edit:partner")
    const canDelete = !!user && hasPermission(user, "delete:partner")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Partenaires</CardTitle>
                <CardDescription>
                    Espace de gestion des partenaires de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <PartenaireList canEdit={canEdit} canDelete={canDelete} />
                </Suspense>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddPartenaireButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
