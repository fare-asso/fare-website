import { Permission, User, UserPermission } from "@prisma/client";
import prisma from "../db";
import { createClient } from "./server";

export type UserWithPermissions = User & {
    permissions: (UserPermission & {
        permission: Permission;
    })[];
};

export async function getCurrentUserWithPermissions(): Promise<UserWithPermissions | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Match avec public.User
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
        },
    });

    return dbUser;
}
