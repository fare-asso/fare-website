import { Separator } from "@/components/ui/separator";
import prisma from "@/helpers/db";
import { UserPermissionsForm } from "./userPermissionForm";
import { UserInfoForm } from "./userInfoForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    if (!user) {
        return <div>Utilisateur introuvable</div>;
    }

    const allPermissions = await prisma.permission.findMany();

    return (
        <div className="flex h-full w-full flex-col px-4">
            <Link
                href="/dashboard/users"
                className="mb-4 text-sm underline opacity-80 transition-all hover:font-bold"
            >
                &lsaquo; Retour aux utilisateurs
            </Link>

            {/* User Info */}
            <div className="flex flex-col gap-2">
                <h2 className="mb-4 text-2xl font-bold">
                    Informations de l'utilisateur
                </h2>
                <UserInfoForm user={user} />
            </div>

            <Separator className="my-4" />

            {/* Permissions */}
            <div className="flex flex-col gap-2 pb-4">
                <h2 className="!mb-2 text-2xl font-bold">Permissions</h2>
                <UserPermissionsForm
                    userId={user.id}
                    userPermissions={user.permissions.map(
                        (up) => up.permissionId,
                    )}
                    allPermissions={allPermissions}
                />
            </div>
        </div>
    );
}
