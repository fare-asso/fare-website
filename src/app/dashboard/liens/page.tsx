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
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Liens"
}

export default async function Liens() {
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

    const su = new StorageUtils()

    const result = await Promise.all([
        tryCatch(
            prisma.linkCategory.findMany({
                include: {
                    liens: {
                        orderBy: { order: "asc" }
                    }
                },
                orderBy: { order: "asc" }
            })
        ),
        tryCatch(
            prisma.communiqueDePresse.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            })
        )
    ])
    const categories = result[0].success ? result[0].value : []
    const files = (result[1].success ? result[1].value : []).map((file) => ({
        url: su.from("communique-de-presse").getPublicUrl(file.filePath, false),
        name: file.name
    }))

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
                        files={files}
                        canCreate={canCreate}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                </Suspense>
            </CardContent>
        </Card>
    )
}
