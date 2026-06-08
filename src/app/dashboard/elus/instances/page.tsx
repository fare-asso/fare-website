import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import InstanceList from "@/components/dashboard/elus/instanceList"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export const metadata: Metadata = {
    title: "Instances"
}

export default async function Instances() {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        redirect("/login")
    }
    if (!hasPermission(user, "access:instances")) {
        redirect("/dashboard/unauthorized")
    }
    const canCreate = !!user && hasPermission(user, "create:instance")
    const canEdit = !!user && hasPermission(user, "edit:instance")
    const canDelete = !!user && hasPermission(user, "delete:instance")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Instances</CardTitle>
                <CardDescription>
                    Espace de gestion des instances de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargement...</p>}>
                    <InstanceList
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                </Suspense>
            </CardContent>
        </Card>
    )
}
