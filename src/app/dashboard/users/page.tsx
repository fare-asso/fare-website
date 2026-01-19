import type { Metadata } from "next"
import { Suspense } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db"
import { columns, type UserWithPermissionsRow } from "./columns"
import { DataTable } from "./data-table"
import { ShowDeletedToggle } from "./showDeletedToggle"

export const metadata: Metadata = {
    title: "Utilisateurs"
}

type Props = {
    searchParams: Promise<{ showDeleted?: string }>
}

export default async function UsersPage({ searchParams }: Props) {
    const params = await searchParams
    const showDeleted = params.showDeleted === "true"

    const users = await prisma.user.findMany({
        where: showDeleted ? {} : { deletedAt: null },
        include: {
            permissions: {
                include: {
                    permission: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

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
                <Suspense fallback={null}>
                    <ShowDeletedToggle />
                </Suspense>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <DataTable
                    columns={columns}
                    data={typedUsers}
                    showDeleted={showDeleted}
                />
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    )
}
