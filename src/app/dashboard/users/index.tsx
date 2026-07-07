import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import {
    columns,
    type UserWithPermissionsRow
} from "@/components/dashboard/users/columns"
import { DataTable } from "@/components/dashboard/users/data-table"
import { ShowDeletedToggle } from "@/components/dashboard/users/showDeletedToggle"
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
import { dashboardTitle } from "@/lib/seo"

const getUsersPageData = createServerFn()
    .inputValidator((data: { showDeleted?: boolean }) => data)
    .handler(async ({ data }) => {
        const users = await prisma.user.findMany({
            where: data.showDeleted ? {} : { deletedAt: null },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const currentUser = await getCurrentUserWithPermissions()
        return {
            users,
            canEdit: !!currentUser && hasPermission(currentUser, "edit:user"),
            canDelete:
                !!currentUser && hasPermission(currentUser, "delete:user")
        }
    })

export const Route = createFileRoute("/dashboard/users/")({
    validateSearch: (s: Record<string, unknown>): { showDeleted?: true } =>
        s.showDeleted === true || s.showDeleted === "true"
            ? { showDeleted: true }
            : {},
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => await getUsersPageData({ data: deps }),
    head: () => ({ meta: [{ title: dashboardTitle("Utilisateurs") }] }),
    component: UsersPage
})

function UsersPage() {
    const { users, canEdit, canDelete } = Route.useLoaderData()
    const { showDeleted } = Route.useSearch()

    // Cast users to match the expected type
    const typedUsers = users as unknown as UserWithPermissionsRow[]

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
                    data={typedUsers}
                    showDeleted={showDeleted === true}
                    canEdit={canEdit}
                    canDelete={canDelete}
                />
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}
