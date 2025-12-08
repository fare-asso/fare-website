import { Separator } from "@/components/ui/separator"
import prisma from "@/helpers/db"
import { UserPermissionsForm } from "./userPermissionForm"
import { UserInfoForm } from "./userInfoForm"

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

    return (
        <div className="flex h-full w-full flex-col overflow-y-auto px-4 [&_h2]:font-bold">
            <h2>Informations</h2>
            <UserInfoForm user={user} />
            <Separator className="my-4" />
            <h2>Permissions</h2>
            <UserPermissionsForm
                userId={user.id}
                userPermissions={user.permissions.map((p) => p.permission.id)}
                allPermissions={allPermissions}
            />
        </div>
    )
}
