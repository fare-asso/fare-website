import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { InstanceWithLogo } from "@/actions/instances/listInstancesAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import InstanceList from "./instanceList"

interface InstancesPageProps {
    user: ShellUser
    pathname: string
    initialInstances: InstanceWithLogo[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
}

function InstancesContent({
    initialInstances,
    canCreate,
    canEdit,
    canDelete
}: Omit<InstancesPageProps, "user" | "pathname">) {
    const { data: instances } = useQuery<InstanceWithLogo[]>({
        queryKey: ["instances"],
        queryFn: async () => {
            const { data, error } =
                await actions.instances.listInstancesAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des instances.")
            }
            return data.value
        },
        initialData: initialInstances
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Instances</CardTitle>
                <CardDescription>
                    Espace de gestion des instances de la Fédération
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <InstanceList
                    instances={instances}
                    canCreate={canCreate}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
        </Card>
    )
}

export default function InstancesPage({
    user,
    pathname,
    ...rest
}: InstancesPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <InstancesContent {...rest} />
        </DashboardShell>
    )
}
