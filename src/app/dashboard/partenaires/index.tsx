import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import AddPartenaireButton from "@/components/dashboard/partenaires/addPartenaireButton"
import PartenaireList, {
    type PartenaireWithLogo
} from "@/components/dashboard/partenaires/partenaireList"
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

const getPartenairesPerms = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canCreate: !!user && hasPermission(user, "create:partner"),
        canEdit: !!user && hasPermission(user, "edit:partner"),
        canDelete: !!user && hasPermission(user, "delete:partner")
    }
})

const getPartenaires = createServerFn().handler(
    async (): Promise<PartenaireWithLogo[] | null> => {
        const supabase = createClient()

        const partenaires = await tryCatch(
            prisma.partenaire.findMany({
                orderBy: { name: "asc" }
            })
        )
        if (!partenaires.success) {
            return null
        }

        return partenaires.value.map((partenaire) => ({
            partenaire,
            logoUrl: supabase.storage
                .from("partner-pictures")
                .getPublicUrl(partenaire.logoPath).data.publicUrl
        }))
    }
)

export const Route = createFileRoute("/dashboard/partenaires/")({
    loader: async () => ({
        perms: await getPartenairesPerms(),
        partenaires: getPartenaires()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Partenaires") }] }),
    component: Partenaires
})

function Partenaires() {
    const { perms, partenaires } = Route.useLoaderData()

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Partenaires</CardTitle>
                <CardDescription>
                    Espace de gestion des partenaires de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <Await promise={partenaires} fallback={<p>Chargements...</p>}>
                    {(value) => (
                        <PartenaireList
                            partenaires={value}
                            canEdit={perms.canEdit}
                            canDelete={perms.canDelete}
                        />
                    )}
                </Await>
            </CardContent>
            {perms.canCreate ? (
                <CardFooter className="p-0">
                    <AddPartenaireButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
