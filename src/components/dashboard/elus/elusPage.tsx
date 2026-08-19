import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { InstanceTree } from "@/actions/elus/listElusAction"
import { DashboardShell } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import BulkImportElusButton from "./bulkImportElusButton"
import EluList from "./eluList"

interface ElusPageProps {
    initialInstances: InstanceTree[]
    canCreateElu: boolean
    canEditElu: boolean
    canDeleteElu: boolean
    canCreateConseil: boolean
    canEditConseil: boolean
    canDeleteConseil: boolean
}

function ElusContent({
    initialInstances,
    canCreateElu,
    canEditElu,
    canDeleteElu,
    canCreateConseil,
    canEditConseil,
    canDeleteConseil
}: ElusPageProps) {
    const { data: instances } = useQuery<InstanceTree[]>({
        queryKey: ["elus"],
        queryFn: async () => {
            const { data, error } = await actions.elus.listElusAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des élu·e·s.")
            }
            return data.value
        },
        initialData: initialInstances
    })

    const instanceOptions = instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        conseils: instance.conseils.map((conseil) => ({
            id: conseil.id,
            name: conseil.name
        }))
    }))

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex justify-between p-0">
                <div>
                    <CardTitle>Élu·e·s</CardTitle>
                    <CardDescription>
                        Espace de gestion des élu·e·s de la Fédération
                    </CardDescription>
                </div>
                <BulkImportElusButton instances={instanceOptions} />
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <EluList
                    instances={instances}
                    instanceOptions={instanceOptions}
                    canCreateElu={canCreateElu}
                    canEditElu={canEditElu}
                    canDeleteElu={canDeleteElu}
                    canCreateConseil={canCreateConseil}
                    canEditConseil={canEditConseil}
                    canDeleteConseil={canDeleteConseil}
                />
            </CardContent>
        </Card>
    )
}

export default function ElusPage({ ...rest }: ElusPageProps) {
    return (
        <DashboardShell>
            <ElusContent {...rest} />
        </DashboardShell>
    )
}
