import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { LinksData } from "@/actions/links/listLinksAction"
import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddLinkCategoryButton from "./addLinkCategoryButton"
import LinksManager from "./linksManager"

interface LinksPageProps {
    initialData: LinksData
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function LinksContent({
    initialData,
    canCreate,
    canEdit,
    canDelete
}: LinksPageProps) {
    const { data } = useQuery({
        queryKey: ["links"],
        queryFn: async () => {
            const { data, error } = await actions.links.listLinksAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des liens.")
            }
            return data.value
        },
        initialData
    })

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
                    categories={data.categories}
                    files={data.files}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
        </Card>
    )
}

export default function LinksPage({ ...rest }: LinksPageProps) {
    return (
        <DashboardShell>
            <LinksContent {...rest} />
        </DashboardShell>
    )
}
