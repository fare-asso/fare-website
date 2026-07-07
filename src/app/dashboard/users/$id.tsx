import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"

import { DeleteUserButton } from "@/components/dashboard/users/deleteUserButton"
import { RestoreUserButton } from "@/components/dashboard/users/restoreUserButton"
import { UserInfoForm } from "@/components/dashboard/users/userInfoForm"
import { UserPermissionsForm } from "@/components/dashboard/users/userPermissionForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { dashboardTitle } from "@/lib/seo"

const getUserPageData = createServerFn()
    .inputValidator((id: string) => id)
    .handler(async ({ data: id }) => {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        })

        if (!user) {
            return null
        }

        const currentUser = await getCurrentUserWithPermissions()
        const allPermissions = await prisma.permission.findMany()

        return {
            user,
            allPermissions,
            canEdit: !!currentUser && hasPermission(currentUser, "edit:user"),
            canDelete:
                !!currentUser && hasPermission(currentUser, "delete:user"),
            canEditPermissions:
                !!currentUser &&
                hasPermission(currentUser, "edit:user-permissions")
        }
    })

export const Route = createFileRoute("/dashboard/users/$id")({
    loader: async ({ params }) => ({
        id: params.id,
        data: await getUserPageData({ data: params.id })
    }),
    head: ({ loaderData }) => ({
        meta: [
            {
                title: dashboardTitle(
                    `Utilisateur ${loaderData ? loaderData.id : ""}`
                )
            }
        ]
    }),
    component: UserPage
})

function UserPage() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <div>Utilisateur introuvable</div>
    }

    const { user, allPermissions, canEdit, canDelete, canEditPermissions } =
        data
    const isDeleted = user.deletedAt !== null

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto px-4 pb-8">
            {/* Deleted user warning banner */}
            {isDeleted && user.deletedAt && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Utilisateur supprime</AlertTitle>
                    <AlertDescription>
                        Cet utilisateur a ete supprime le{" "}
                        {format(user.deletedAt, "d MMMM yyyy 'a' HH:mm", {
                            locale: fr
                        })}
                        . Il ne peut plus se connecter.
                    </AlertDescription>
                </Alert>
            )}

            {/* User Info Section */}
            {canEdit ? (
                <>
                    <section>
                        <h2 className="mb-4 text-lg font-bold">Informations</h2>
                        <UserInfoForm user={user} />
                    </section>

                    <Separator />
                </>
            ) : null}

            {/* Permissions Section */}
            {canEditPermissions ? (
                <>
                    <section>
                        <h2 className="mb-4 text-lg font-bold">Permissions</h2>
                        <UserPermissionsForm
                            userId={user.id}
                            userPermissions={user.permissions.map(
                                (p) => p.permission.id
                            )}
                            allPermissions={allPermissions}
                        />
                    </section>

                    <Separator />
                </>
            ) : null}

            {/* Danger Zone */}
            {canEdit || canDelete ? (
                <section>
                    {isDeleted ? (
                        canEdit ? (
                            <RestoreUserButton
                                userId={user.id}
                                userName={user.name}
                            />
                        ) : null
                    ) : canDelete ? (
                        <DeleteUserButton
                            userId={user.id}
                            userName={user.name}
                        />
                    ) : null}
                </section>
            ) : null}
        </div>
    )
}
