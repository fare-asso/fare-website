import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import type { UserWithPermissionsRow } from "@/actions/users/listUsersAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { useSearchParam } from "@/hooks/useSearchParam"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { ShowDeletedToggle } from "./showDeletedToggle"

interface UsersPageProps {
    user: ShellUser
    pathname: string
    initialData: UserWithPermissionsRow[]
    canEdit: boolean
    canDelete: boolean
}

function UsersContent({
    initialData,
    canEdit,
    canDelete
}: Omit<UsersPageProps, "user" | "pathname">) {
    const [showDeletedParam] = useSearchParam("showDeleted", "false")
    const showDeleted = showDeletedParam === "true"

    const { data: users } = useQuery({
        queryKey: ["users", showDeleted],
        queryFn: async () => {
            const { data, error } = await actions.users.listUsersAction({
                showDeleted
            })
            if (error || !data.success) {
                throw new Error("Échec du chargement des utilisateurs.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-0">
                <div>
                    <CardTitle>Utilisateurs</CardTitle>
                    <CardDescription>
                        Espace de gestion des utilisateurs du site de la FARE
                    </CardDescription>
                </div>
                <ShowDeletedToggle />
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <DataTable
                    columns={columns}
                    data={users}
                    showDeleted={showDeleted}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}

export default function UsersPage({ user, pathname, ...rest }: UsersPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <UsersContent {...rest} />
        </DashboardShell>
    )
}
