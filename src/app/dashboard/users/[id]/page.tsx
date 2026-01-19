import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { AlertTriangle } from "lucide-react"
import type { Metadata } from "next"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import prisma from "@/helpers/db"
import { DeleteUserButton } from "./deleteUserButton"
import { RestoreUserButton } from "./restoreUserButton"
import { UserInfoForm } from "./userInfoForm"
import { UserPermissionsForm } from "./userPermissionForm"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const id = (await params).id
    return {
        title: `Utilisateur ${id}`
    }
}

export default async function UserPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

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
        return <div>Utilisateur introuvable</div>
    }

    const allPermissions = await prisma.permission.findMany()
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
            <section>
                <h2 className="mb-4 font-bold text-lg">Informations</h2>
                <UserInfoForm user={user} />
            </section>

            <Separator />

            {/* Permissions Section */}
            <section>
                <h2 className="mb-4 font-bold text-lg">Permissions</h2>
                <UserPermissionsForm
                    userId={user.id}
                    userPermissions={user.permissions.map(
                        (p) => p.permission.id
                    )}
                    allPermissions={allPermissions}
                />
            </section>

            <Separator />

            {/* Danger Zone */}
            <section>
                {isDeleted ? (
                    <RestoreUserButton userId={user.id} userName={user.name} />
                ) : (
                    <DeleteUserButton userId={user.id} userName={user.name} />
                )}
            </section>
        </div>
    )
}
