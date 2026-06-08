import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import AddLinkCategoryButton from "@/components/dashboard/links/addLinkCategoryButton"
import LinksManager from "@/components/dashboard/links/linksManager"
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
    title: "Liens"
}

export default async function Liens(): Promise<React.JSX.Element> {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        redirect("/login")
    }
    if (!hasPermission(user, "access:liens")) {
        redirect("/dashboard/unauthorized")
    }

    const canCreate = hasPermission(user, "create:lien")
    const canEdit = hasPermission(user, "edit:lien")
    const canDelete = hasPermission(user, "delete:lien")

    const result = await tryCatch(
        prisma.linkCategory.findMany({
            include: {
                liens: {
                    orderBy: { order: "asc" }
                }
            },
            orderBy: { order: "asc" }
        })
    )
    const categories = result.success ? result.value : []

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex justify-between p-0">
                <div>
                    <CardTitle>Liens</CardTitle>
                    <CardDescription>
                        Gestion des liens de la FARE
                    </CardDescription>
                </div>
                {canCreate ? <AddLinkCategoryButton /> : null}
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Suspense fallback={<p>Chargement...</p>}>
                    <LinksManager
                        categories={categories}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                </Suspense>
            </CardContent>
        </Card>
    )
}
