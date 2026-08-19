import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { PartenaireWithLogo } from "@/actions/partenaires/listPartenairesAction"
import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddPartenaireButton from "./addPartenaireButton"
import PartenaireList from "./partenaireList"

interface PartenairesPageProps {
    initialData: PartenaireWithLogo[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function PartenairesContent({
    initialData,
    canCreate,
    canEdit,
    canDelete
}: PartenairesPageProps) {
    const { data: partenaires } = useQuery({
        queryKey: ["partenaires"],
        queryFn: async () => {
            const { data, error } =
                await actions.partenaires.listPartenairesAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des partenaires.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Partenaires</CardTitle>
                <CardDescription>
                    Espace de gestion des partenaires de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <PartenaireList
                    partenaires={partenaires}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddPartenaireButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function PartenairesPage({ ...rest }: PartenairesPageProps) {
    return (
        <DashboardShell>
            <PartenairesContent {...rest} />
        </DashboardShell>
    )
}
