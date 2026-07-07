import { createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import AddLinkCategoryButton from "@/components/dashboard/links/addLinkCategoryButton"
import LinksManager from "@/components/dashboard/links/linksManager"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getLiensPageData = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        throw redirect({ href: "/login" })
    }
    if (!hasPermission(user, "access:liens")) {
        throw redirect({ href: "/dashboard/unauthorized" })
    }

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
    const allfiles = (result[1].success ? result[1].value : []).map((file) => ({
        url: su.from("communique-de-presse").getPublicUrl(file.filePath, false),
        name: file.name,
        type: file.type
    }))

    return {
        categories,
        files: { ...Object.groupBy(allfiles, ({ type }) => type) },
        canCreate: hasPermission(user, "create:lien"),
        canEdit: hasPermission(user, "edit:lien"),
        canDelete: hasPermission(user, "delete:lien")
    }
})

export const Route = createFileRoute("/dashboard/liens/")({
    loader: async () => await getLiensPageData(),
    head: () => ({ meta: [{ title: dashboardTitle("Liens") }] }),
    component: Liens
})

function Liens() {
    const { categories, files, canCreate, canEdit, canDelete } =
        Route.useLoaderData()

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
                <LinksManager
                    categories={categories}
                    files={files}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
        </Card>
    )
}
