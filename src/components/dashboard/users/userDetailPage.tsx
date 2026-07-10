import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"

import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Permission, User } from "@/generated/prisma/client"

import { DeleteUserButton } from "./deleteUserButton"
import { RestoreUserButton } from "./restoreUserButton"
import { UserInfoForm } from "./userInfoForm"
import { UserPermissionsForm } from "./userPermissionForm"

interface UserDetailPageProps {
    user: ShellUser
    pathname: string
    targetUser: User
    userPermissionIds: number[]
    allPermissions: Permission[]
    canEdit: boolean
    canDelete: boolean
    canEditPermissions: boolean
}

function UserDetailContent({
    targetUser,
    userPermissionIds,
    allPermissions,
    canEdit,
    canDelete,
    canEditPermissions
}: Omit<UserDetailPageProps, "user" | "pathname">) {
    const isDeleted = targetUser.deletedAt !== null

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-y-auto px-4 pb-8">
            {isDeleted && targetUser.deletedAt && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Utilisateur supprime</AlertTitle>
                    <AlertDescription>
                        Cet utilisateur a ete supprime le{" "}
                        {format(targetUser.deletedAt, "d MMMM yyyy 'a' HH:mm", {
                            locale: fr
                        })}
                        . Il ne peut plus se connecter.
                    </AlertDescription>
                </Alert>
            )}

            {canEdit ? (
                <>
                    <section>
                        <h2 className="mb-4 text-lg font-bold">Informations</h2>
                        <UserInfoForm user={targetUser} />
                    </section>

                    <Separator />
                </>
            ) : null}

            {canEditPermissions ? (
                <>
                    <section>
                        <h2 className="mb-4 text-lg font-bold">Permissions</h2>
                        <UserPermissionsForm
                            userId={targetUser.id}
                            userPermissions={userPermissionIds}
                            allPermissions={allPermissions}
                        />
                    </section>

                    <Separator />
                </>
            ) : null}

            {canEdit || canDelete ? (
                <section>
                    {isDeleted ? (
                        canEdit ? (
                            <RestoreUserButton
                                userId={targetUser.id}
                                userName={targetUser.name}
                            />
                        ) : null
                    ) : canDelete ? (
                        <DeleteUserButton
                            userId={targetUser.id}
                            userName={targetUser.name}
                        />
                    ) : null}
                </section>
            ) : null}
        </div>
    )
}

export default function UserDetailPage({
    user,
    pathname,
    ...rest
}: UserDetailPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <UserDetailContent {...rest} />
        </DashboardShell>
    )
}
