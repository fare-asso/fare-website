"use server";

import prisma from "@/helpers/db";
import { hasPermission, hasRole } from "@/helpers/permissions";
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth";

export default async function updateUserPermissions(
    userId: string,
    permissions: number[],
) {
    const user = await getCurrentUserWithPermissions();
    if (!user) {
        throw new Error("Unauthorized: User not found");
    }

    if (!hasRole(user, "ADMIN")) {
        throw new Error("Forbidden: Admin only");
    }

    if (!hasPermission(user, "edit:user-permissions")) {
        throw new Error("Forbidden: Insufficient permissions");
    }

    // Commencer une transaction pour supprimer les anciennes permissions et ajouter les nouvelles
    try {
        await prisma.$transaction(async (tx) => {
            // Supprimer les permissions existantes pour cet utilisateur
            await tx.userPermission.deleteMany({
                where: {
                    userId,
                },
            });

            // Ajouter les nouvelles permissions
            const newPermissions = permissions.map((permissionId) => ({
                userId,
                permissionId,
            }));

            await tx.userPermission.createMany({
                data: newPermissions,
                skipDuplicates: true,
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to update permissions:", error);
        return {
            success: false,
            error: "An error occurred while updating permissions.",
        };
    }
}
